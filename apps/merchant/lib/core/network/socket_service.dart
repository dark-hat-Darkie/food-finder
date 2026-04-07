import 'dart:io';

import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../storage/auth_storage.dart';

class SocketService {
  static SocketService? _instance;
  IO.Socket? _socket;

  SocketService._();

  static SocketService get instance => _instance ??= SocketService._();

  IO.Socket get socket {
    _socket ??= IO.io(
        'http://${Platform.isAndroid ? '10.0.2.2' : 'localhost'}:3001',
        <String, dynamic>{
          'transports': ['websocket'],
          'autoConnect': false,
        });
    return _socket!;
  }

  void connect() {
    if (!socket.connected) {
      socket.connect();
    }
  }

  void joinMerchant(String merchantId) {
    socket.emit('join-merchant', merchantId);
  }

  void joinOrder(String orderId) {
    socket.emit('join-order', orderId);
  }

  void leaveMerchant(String merchantId) {
    socket.emit('leave-merchant', merchantId);
  }

  void leaveOrder(String orderId) {
    socket.emit('leave-order', orderId);
  }

  void onNewOrder(Function(dynamic) callback) {
    socket.on('new-order', callback);
  }

  void onOrderUpdated(Function(dynamic) callback) {
    socket.on('order-updated', callback);
  }

  void onOrderStatusChanged(Function(dynamic) callback) {
    socket.on('order-status-changed', callback);
  }

  void dispose() {
    socket.disconnect();
    socket.dispose();
    _socket = null;
  }
}
