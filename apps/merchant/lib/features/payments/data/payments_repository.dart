import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';

final paymentsRepositoryProvider = Provider<PaymentsRepository>((ref) {
  return PaymentsRepository(ref.read(dioProvider));
});

class PaymentsRepository {
  final Dio _dio;

  PaymentsRepository(this._dio);

  Future<List<dynamic>> getPayments() async {
    final response = await _dio.get('/merchant-payments/merchant');
    return response.data as List;
  }
}
