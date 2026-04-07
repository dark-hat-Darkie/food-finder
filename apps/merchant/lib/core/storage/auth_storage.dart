import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthStorage {
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'auth_token';
  static const _merchantIdKey = 'merchant_id';
  static const _merchantNameKey = 'merchant_name';

  Future<void> saveAuth({
    required String token,
    required String merchantId,
    required String merchantName,
  }) async {
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _merchantIdKey, value: merchantId);
    await _storage.write(key: _merchantNameKey, value: merchantName);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  Future<String?> getMerchantId() async {
    return await _storage.read(key: _merchantIdKey);
  }

  Future<String?> getMerchantName() async {
    return await _storage.read(key: _merchantNameKey);
  }

  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null;
  }

  Future<void> clearAuth() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _merchantIdKey);
    await _storage.delete(key: _merchantNameKey);
  }
}
