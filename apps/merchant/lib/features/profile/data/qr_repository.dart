import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/auth_storage.dart';

final qrCodeProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final merchantId = await AuthStorage().getMerchantId();
  if (merchantId == null) return null;

  final dio = ref.read(dioProvider);
  try {
    final profileRes = await dio.get('/auth/merchant/profile');
    final profile = profileRes.data as Map<String, dynamic>;

    final tables = profile['foodCourt']?['tables'] as List?;
    if (tables == null || tables.isEmpty) return null;

    final table = tables.first;
    final tableId = table['id'] as String;

    final qrRes = await dio.get('/qrcodes/table/$tableId');
    return qrRes.data as Map<String, dynamic>;
  } catch (e) {
    return null;
  }
});
