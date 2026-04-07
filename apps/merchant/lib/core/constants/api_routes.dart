import 'dart:io';

class ApiRoutes {
  static const String _host = 'localhost';
  static const String _port = '3001';
  static String get baseUrl =>
      'http://${Platform.isAndroid ? '10.0.2.2' : _host}:$_port/api';

  static String get merchantLogin => '/auth/merchant/login';
  static String get merchantRegister => '/auth/merchant/register';
  static String get merchantProfile => '/auth/merchant/profile';

  static String merchantOrders(String id) => '/merchants/$id/orders';
  static String merchantStats(String id) => '/merchants/$id/stats';
  static String merchantMenuItems(String id) => '/merchants/$id/menu-items';
  static String merchantCategories(String id) => '/merchants/$id/categories';
  static String merchantCategory(String id, String catId) =>
      '/merchants/$id/categories/$catId';
  static String merchantMenuItem(String id, String itemId) =>
      '/merchants/$id/menu-items/$itemId';
  static String merchantBankDetails(String id) => '/merchants/$id/bank-details';
  static String merchantProfileUpdate(String id) => '/merchants/$id/profile';
  static String get merchantPayments => '/merchant-payments/merchant';
  static String updateOrderStatus(String orderId) => '/orders/$orderId/status';
  static String get upload => '/upload';
}
