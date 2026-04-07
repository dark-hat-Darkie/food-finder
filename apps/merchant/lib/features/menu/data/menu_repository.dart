import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/auth_storage.dart';

final menuRepositoryProvider = Provider<MenuRepository>((ref) {
  return MenuRepository(ref.read(dioProvider));
});

class MenuRepository {
  final Dio _dio;

  MenuRepository(this._dio);

  Future<String> _getMerchantId() async {
    return (await AuthStorage().getMerchantId())!;
  }

  Future<List<dynamic>> getMenuItems() async {
    final merchantId = await _getMerchantId();
    final response = await _dio.get('/merchants/$merchantId/menu-items');
    return response.data as List;
  }

  Future<Map<String, dynamic>> createMenuItem(Map<String, dynamic> data) async {
    final merchantId = await _getMerchantId();
    final response = await _dio.post('/merchants/$merchantId/menu-items', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateMenuItem(String itemId, Map<String, dynamic> data) async {
    final merchantId = await _getMerchantId();
    final response = await _dio.patch('/merchants/$merchantId/menu-items/$itemId', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<void> deleteMenuItem(String itemId) async {
    final merchantId = await _getMerchantId();
    await _dio.delete('/merchants/$merchantId/menu-items/$itemId');
  }

  Future<List<dynamic>> getCategories() async {
    final merchantId = await _getMerchantId();
    final response = await _dio.get('/merchants/$merchantId/categories');
    return response.data as List;
  }

  Future<Map<String, dynamic>> createCategory(Map<String, dynamic> data) async {
    final merchantId = await _getMerchantId();
    final response = await _dio.post('/merchants/$merchantId/categories', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<void> deleteCategory(String categoryId) async {
    final merchantId = await _getMerchantId();
    await _dio.delete('/merchants/$merchantId/categories/$categoryId');
  }
}
