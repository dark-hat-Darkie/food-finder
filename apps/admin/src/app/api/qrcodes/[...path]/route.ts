import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { path } = await params
  const endpoint = `/qrcodes/${path.join('/')}`

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${(session as any).accessToken}` },
  })

  const data = await res.json()
  return NextResponse.json(data)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { path } = await params
  const endpoint = `/qrcodes/${path.join('/')}`

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${(session as any).accessToken}` },
  })

  const data = await res.json()
  return NextResponse.json(data)
}
