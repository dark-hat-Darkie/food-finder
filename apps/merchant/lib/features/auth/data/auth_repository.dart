import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/auth_storage.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.read(dioProvider));
});

class AuthRepository {
  final Dio _dio;

  AuthRepository(this._dio);

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post('/auth/merchant/login', data: {
      'email': email,
      'password': password,
    });

    final data = response.data as Map<String, dynamic>;
    final user = data['user'] as Map<String, dynamic>;

    await AuthStorage().saveAuth(
      token: data['accessToken'] as String,
      merchantId: user['id'] as String,
      merchantName: user['name'] as String,
    );

    return data;
  }

  Future<Map<String, dynamic>> getProfile() async {
    final response = await _dio.get('/auth/merchant/profile');
    return response.data as Map<String, dynamic>;
  }

  Future<void> logout() async {
    await AuthStorage().clearAuth();
  }
}
