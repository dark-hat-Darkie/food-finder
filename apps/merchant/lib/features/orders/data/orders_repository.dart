import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/auth_storage.dart';

final ordersRepositoryProvider = Provider<OrdersRepository>((ref) {
  return OrdersRepository(ref.read(dioProvider));
});

class OrdersRepository {
  final Dio _dio;

  OrdersRepository(this._dio);

  Future<String> _getMerchantId() async {
    return (await AuthStorage().getMerchantId())!;
  }

  Future<Map<String, dynamic>> getOrders({String? status, int page = 1}) async {
    final merchantId = await _getMerchantId();
    String path = '/merchants/$merchantId/orders?page=$page&limit=50';
    if (status != null) path += '&status=$status';
    final response = await _dio.get(path);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getOrder(String orderId) async {
    final response = await _dio.get('/orders/$orderId');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateStatus(String orderId, String status) async {
    final response = await _dio.patch(
      '/orders/$orderId/status',
      data: {'status': status},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getStats() async {
    final merchantId = await _getMerchantId();
    final response = await _dio.get('/merchants/$merchantId/stats');
    return response.data as Map<String, dynamic>;
  }
}
