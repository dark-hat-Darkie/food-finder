import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/auth_storage.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepository(ref.read(dioProvider));
});

class DashboardRepository {
  final Dio _dio;

  DashboardRepository(this._dio);

  Future<String> _getMerchantId() async {
    return (await AuthStorage().getMerchantId())!;
  }

  Future<Map<String, dynamic>> getDashboardStats() async {
    final merchantId = await _getMerchantId();
    final response = await _dio.get('/merchants/$merchantId/stats');
    return response.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getRevenueTrend({int days = 7}) async {
    final merchantId = await _getMerchantId();
    final response = await _dio.get(
      '/merchants/$merchantId/analytics/revenue?days=$days',
    );
    return response.data as List;
  }

  Future<List<dynamic>> getOrdersChart({int days = 7}) async {
    final merchantId = await _getMerchantId();
    final response = await _dio.get(
      '/merchants/$merchantId/analytics/orders?days=$days',
    );
    return response.data as List;
  }

  Future<List<dynamic>> getTopMenuItems({int limit = 5}) async {
    final merchantId = await _getMerchantId();
    final response = await _dio.get(
      '/merchants/$merchantId/analytics/top-items?limit=$limit',
    );
    return response.data as List;
  }

  Future<List<dynamic>> getOrderStatusBreakdown() async {
    final merchantId = await _getMerchantId();
    final response = await _dio.get(
      '/merchants/$merchantId/analytics/order-status-breakdown',
    );
    return response.data as List;
  }

  Future<Map<String, dynamic>> getHourlyDistribution() async {
    final merchantId = await _getMerchantId();
    final response = await _dio.get(
      '/merchants/$merchantId/analytics/hourly-distribution',
    );
    return response.data as Map<String, dynamic>;
  }
}
