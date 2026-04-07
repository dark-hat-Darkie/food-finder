import { CartFab } from './cart-fab'

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <CartFab />
    </>
  )
}
