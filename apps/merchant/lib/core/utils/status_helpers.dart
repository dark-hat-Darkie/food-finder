import 'package:flutter/material.dart';

class StatusHelpers {
  static Color getOrderStatusColor(String status) {
    switch (status) {
      case 'PENDING':
        return Colors.orange;
      case 'ACCEPTED':
        return Colors.blue;
      case 'PREPARING':
        return Colors.deepOrange;
      case 'READY':
        return Colors.green;
      case 'DELIVERED':
        return Colors.grey;
      case 'CANCELLED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  static IconData getOrderStatusIcon(String status) {
    switch (status) {
      case 'PENDING':
        return Icons.schedule;
      case 'ACCEPTED':
        return Icons.check_circle;
      case 'PREPARING':
        return Icons.local_dining;
      case 'READY':
        return Icons.done_all;
      case 'DELIVERED':
        return Icons.delivery_dining;
      case 'CANCELLED':
        return Icons.cancel;
      default:
        return Icons.receipt;
    }
  }

  static String getOrderStatusLabel(String status) {
    switch (status) {
      case 'PENDING':
        return 'New Order';
      case 'ACCEPTED':
        return 'Accepted';
      case 'PREPARING':
        return 'Preparing';
      case 'READY':
        return 'Ready';
      case 'DELIVERED':
        return 'Delivered';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }

  static Color getPaymentStatusColor(String status) {
    switch (status) {
      case 'PENDING':
        return Colors.orange;
      case 'APPROVED':
        return Colors.blue;
      case 'PAID':
        return Colors.green;
      case 'REJECTED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
