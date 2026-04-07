import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('join-merchant')
  handleJoinMerchant(client: Socket, merchantId: string) {
    client.join(`merchant:${merchantId}`)
  }

  @SubscribeMessage('join-order')
  handleJoinOrder(client: Socket, orderId: string) {
    client.join(`order:${orderId}`)
  }

  @SubscribeMessage('leave-merchant')
  handleLeaveMerchant(client: Socket, merchantId: string) {
    client.leave(`merchant:${merchantId}`)
  }

  @SubscribeMessage('leave-order')
  handleLeaveOrder(client: Socket, orderId: string) {
    client.leave(`order:${orderId}`)
  }

  emitNewOrder(merchantId: string, order: any) {
    this.server.to(`merchant:${merchantId}`).emit('new-order', order)
  }

  emitOrderStatusUpdate(orderId: string, status: string, order: any) {
    this.server.to(`order:${orderId}`).emit('order-status-changed', { status, order })
    this.server.to(`merchant:${order.merchantId}`).emit('order-updated', { orderId, status, order })
  }
}
