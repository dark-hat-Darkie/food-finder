import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/auth_storage.dart';

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepository(ref.read(dioProvider));
});

class ProfileRepository {
  final Dio _dio;

  ProfileRepository(this._dio);

  Future<Map<String, dynamic>> getProfile() async {
    final response = await _dio.get('/auth/merchant/profile');
    return response.data as Map<String, dynamic>;
  }

  Future<void> updateBankDetails({
    required String bankName,
    required String bankAccountName,
    required String bankAccountNumber,
  }) async {
    final merchantId = await AuthStorage().getMerchantId();
    await _dio.patch('/merchants/$merchantId/bank-details', data: {
      'bankName': bankName,
      'bankAccountName': bankAccountName,
      'bankAccountNumber': bankAccountNumber,
    });
  }

  Future<void> updateProfile({
    String? storeName,
    String? description,
    String? phone,
  }) async {
    final merchantId = await AuthStorage().getMerchantId();
    final data = <String, dynamic>{};
    if (storeName != null) data['storeName'] = storeName;
    if (description != null) data['description'] = description;
    if (phone != null) data['phone'] = phone;
    await _dio.patch('/merchants/$merchantId/profile', data: data);
  }

  Future<void> logout() async {
    await AuthStorage().clearAuth();
  }
}
