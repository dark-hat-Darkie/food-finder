import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../data/orders_repository.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/status_helpers.dart';

final ordersProvider =
    FutureProvider.family<Map<String, dynamic>, String?>((ref, status) {
  return ref.read(ordersRepositoryProvider).getOrders(status: status);
});

final statsProvider = FutureProvider<Map<String, dynamic>>((ref) {
  return ref.read(ordersRepositoryProvider).getStats();
});

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen> {
  String _statusFilter = '';

  @override
  Widget build(BuildContext context) {
    final ordersAsync =
        ref.watch(ordersProvider(_statusFilter.isEmpty ? null : _statusFilter));
    final statsAsync = ref.watch(statsProvider);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(
              ordersProvider(_statusFilter.isEmpty ? null : _statusFilter));
          ref.invalidate(statsProvider);
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverAppBar(
              floating: true,
              snap: true,
              title: const Text('Orders'),
              actions: [
                IconButton(
                  onPressed: () {
                    ref.invalidate(ordersProvider(
                        _statusFilter.isEmpty ? null : _statusFilter));
                    ref.invalidate(statsProvider);
                  },
                  icon: const Icon(Icons.refresh_rounded),
                ),
              ],
            ),
            SliverToBoxAdapter(
              child: statsAsync.when(
                data: (stats) => _buildStatsSection(stats),
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
              ),
            ),
            SliverToBoxAdapter(child: _buildStatusFilter()),
            const SliverToBoxAdapter(child: SizedBox(height: 8)),
            ordersAsync.when(
              data: (data) {
                final orders = data['data'] as List;
                if (orders.isEmpty) {
                  return SliverFillRemaining(
                    hasScrollBody: false,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.receipt_long_rounded,
                              size: 64, color: Colors.grey.shade300),
                          const SizedBox(height: 16),
                          Text('No orders yet',
                              style: TextStyle(
                                  color: Colors.grey.shade500,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500)),
                        ],
                      ),
                    ),
                  );
                }
                return SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => _buildOrderCard(orders[index]),
                      childCount: orders.length,
                    ),
                  ),
                );
              },
              loading: () => const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => SliverFillRemaining(
                child: Center(child: Text('Error: $e')),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 20)),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsSection(Map<String, dynamic> stats) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 4),
      child: Row(
        children: [
          Expanded(
            child: _ModernStatCard(
              title: 'Today',
              value: '${stats['todayOrders'] ?? 0}',
              subtitle: CurrencyFormatter.format(
                  double.tryParse(stats['todayRevenue'].toString()) ?? 0),
              icon: Icons.today_rounded,
              accentColor: const Color(0xFF10B981),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _ModernStatCard(
              title: 'Total',
              value: '${stats['totalOrders'] ?? 0}',
              subtitle: CurrencyFormatter.format(
                  double.tryParse(stats['totalRevenue'].toString()) ?? 0),
              icon: Icons.bar_chart_rounded,
              accentColor: const Color(0xFF3B82F6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusFilter() {
    final statuses = [
      '',
      'PENDING',
      'ACCEPTED',
      'PREPARING',
      'READY',
      'DELIVERED'
    ];
    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        children: statuses.map((status) {
          final isSelected = _statusFilter == status;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              selected: isSelected,
              label: Text(
                status.isEmpty
                    ? 'All'
                    : StatusHelpers.getOrderStatusLabel(status),
                style: TextStyle(
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  fontSize: 13,
                ),
              ),
              onSelected: (_) {
                setState(() => _statusFilter = status);
                ref.invalidate(ordersProvider(status.isEmpty ? null : status));
              },
              selectedColor: const Color(0xFFF97316),
              backgroundColor: const Color(0xFFF1F5F9),
              labelStyle: TextStyle(
                color: isSelected ? Colors.white : const Color(0xFF64748B),
              ),
              side: BorderSide.none,
              visualDensity: VisualDensity.compact,
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildOrderCard(Map<String, dynamic> order) {
    final status = order['status'] as String;
    final table = order['table'] as Map<String, dynamic>?;
    final statusColor = StatusHelpers.getOrderStatusColor(status);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: AppTheme.cardDecoration(),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.go('/orders/${order['id']}'),
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    StatusHelpers.getOrderStatusIcon(status),
                    color: statusColor,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '#${(order['orderNumber'] as String).substring(order['orderNumber'].length - 8)}',
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontFamily: 'monospace',
                              fontSize: 14,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              StatusHelpers.getOrderStatusLabel(status),
                              style: TextStyle(
                                color: statusColor,
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Table #${table?['number'] ?? '-'}',
                            style: const TextStyle(
                              color: Color(0xFF64748B),
                              fontSize: 13,
                            ),
                          ),
                          Text(
                            CurrencyFormatter.format(double.tryParse(
                                    order['totalAmount'].toString()) ??
                                0),
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF1E293B),
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        DateFormat('h:mm a')
                            .format(DateTime.parse(order['createdAt'])),
                        style: const TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ModernStatCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color accentColor;

  const _ModernStatCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.accentColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.statCardDecoration(accentColor: accentColor),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title,
                  style: const TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 12,
                      fontWeight: FontWeight.w500)),
              Icon(icon, color: accentColor, size: 18),
            ],
          ),
          const SizedBox(height: 8),
          Text(value,
              style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF1E293B))),
          const SizedBox(height: 2),
          Text(subtitle,
              style: const TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 12,
                  fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
