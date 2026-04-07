import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../data/dashboard_repository.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/currency_formatter.dart';

final dashboardStatsProvider = FutureProvider<Map<String, dynamic>>((ref) {
  return ref.read(dashboardRepositoryProvider).getDashboardStats();
});

final revenueChartProvider = FutureProvider<List<dynamic>>((ref) {
  return ref.read(dashboardRepositoryProvider).getRevenueTrend();
});

final ordersChartProvider = FutureProvider<List<dynamic>>((ref) {
  return ref.read(dashboardRepositoryProvider).getOrdersChart();
});

final topItemsProvider = FutureProvider<List<dynamic>>((ref) {
  return ref.read(dashboardRepositoryProvider).getTopMenuItems();
});

final statusBreakdownProvider = FutureProvider<List<dynamic>>((ref) {
  return ref.read(dashboardRepositoryProvider).getOrderStatusBreakdown();
});

final hourlyProvider = FutureProvider<Map<String, dynamic>>((ref) {
  return ref.read(dashboardRepositoryProvider).getHourlyDistribution();
});

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(dashboardStatsProvider);
    final revenueAsync = ref.watch(revenueChartProvider);
    final ordersAsync = ref.watch(ordersChartProvider);
    final topItemsAsync = ref.watch(topItemsProvider);
    final statusAsync = ref.watch(statusBreakdownProvider);
    final hourlyAsync = ref.watch(hourlyProvider);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(dashboardStatsProvider);
          ref.invalidate(revenueChartProvider);
          ref.invalidate(ordersChartProvider);
          ref.invalidate(topItemsProvider);
          ref.invalidate(statusBreakdownProvider);
          ref.invalidate(hourlyProvider);
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverAppBar(
              floating: true,
              snap: true,
              expandedHeight: 0,
              title: const Text('Dashboard'),
              actions: [
                IconButton(
                  onPressed: () {
                    ref.invalidate(dashboardStatsProvider);
                    ref.invalidate(revenueChartProvider);
                    ref.invalidate(ordersChartProvider);
                    ref.invalidate(topItemsProvider);
                    ref.invalidate(statusBreakdownProvider);
                    ref.invalidate(hourlyProvider);
                  },
                  icon: const Icon(Icons.refresh_rounded),
                ),
              ],
            ),
            SliverToBoxAdapter(
              child: statsAsync.when(
                data: (stats) => _buildKPISection(context, stats),
                loading: () => _buildKPISection(context, {
                  'todayOrders': 0,
                  'todayRevenue': 0,
                  'totalOrders': 0,
                  'totalRevenue': 0,
                  'pendingOrders': 0,
                  'avgOrderValue': 0,
                }),
                error: (_, __) => _buildKPISection(context, {
                  'todayOrders': 0,
                  'todayRevenue': 0,
                  'totalOrders': 0,
                  'totalRevenue': 0,
                  'pendingOrders': 0,
                  'avgOrderValue': 0,
                }),
              ),
            ),
            SliverToBoxAdapter(
              child: revenueAsync.when(
                data: (data) => data.isEmpty
                    ? const _ChartEmpty(title: 'Revenue Trend')
                    : _RevenueLineChart(data: data),
                loading: () => const _ChartPlaceholder(title: 'Revenue Trend'),
                error: (e, _) => _ChartError(title: 'Revenue Trend', error: e),
              ),
            ),
            SliverToBoxAdapter(
              child: ordersAsync.when(
                data: (data) => data.isEmpty
                    ? const _ChartEmpty(title: 'Orders Overview')
                    : _OrdersBarChart(data: data),
                loading: () =>
                    const _ChartPlaceholder(title: 'Orders Overview'),
                error: (e, _) =>
                    _ChartError(title: 'Orders Overview', error: e),
              ),
            ),
            SliverToBoxAdapter(
              child: statusAsync.when(
                data: (data) => data.isEmpty
                    ? const _ChartEmpty(title: 'Order Status')
                    : _StatusPieChart(data: data),
                loading: () =>
                    const _ChartPlaceholder(title: 'Order Status Breakdown'),
                error: (e, _) => _ChartError(title: 'Order Status', error: e),
              ),
            ),
            SliverToBoxAdapter(
              child: hourlyAsync.when(
                data: (data) {
                  final hours = (data['hours'] as List?) ?? [];
                  return hours.isEmpty
                      ? const _ChartEmpty(title: 'Peak Hours')
                      : _HourlyBarChart(hours: hours);
                },
                loading: () => const _ChartPlaceholder(title: 'Peak Hours'),
                error: (e, _) => _ChartError(title: 'Peak Hours', error: e),
              ),
            ),
            SliverToBoxAdapter(
              child: topItemsAsync.when(
                data: (items) => items.isEmpty
                    ? const _ChartEmpty(title: 'Top Selling Items')
                    : _TopItemsList(items: items),
                loading: () =>
                    const _ChartPlaceholder(title: 'Top Selling Items'),
                error: (e, _) =>
                    _ChartError(title: 'Top Selling Items', error: e),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }

  Widget _buildKPISection(BuildContext context, Map<String, dynamic> stats) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                DateFormat('EEEE, MMM d').format(DateTime.now()),
                style: const TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
              if ((stats['pendingOrders'] ?? 0) > 0)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.orange.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${stats['pendingOrders']} pending',
                    style: const TextStyle(
                      color: Color(0xFFF97316),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _KPICard(
                  title: 'Today\'s Revenue',
                  value: CurrencyFormatter.format(
                    double.tryParse(stats['todayRevenue'].toString()) ?? 0,
                  ),
                  icon: Icons.attach_money_rounded,
                  accentColor: const Color(0xFF10B981),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _KPICard(
                  title: 'Today\'s Orders',
                  value: '${stats['todayOrders'] ?? 0}',
                  icon: Icons.receipt_long_rounded,
                  accentColor: const Color(0xFF3B82F6),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _KPICard(
                  title: 'Total Revenue',
                  value: CurrencyFormatter.format(
                    double.tryParse(stats['totalRevenue'].toString()) ?? 0,
                  ),
                  icon: Icons.account_balance_wallet_rounded,
                  accentColor: const Color(0xFF8B5CF6),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _KPICard(
                  title: 'Avg. Order Value',
                  value: CurrencyFormatter.format(
                    double.tryParse(stats['avgOrderValue'].toString()) ?? 0,
                  ),
                  icon: Icons.trending_up_rounded,
                  accentColor: const Color(0xFFEC4899),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _KPICard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color accentColor;

  const _KPICard({
    required this.title,
    required this.value,
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
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: accentColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: accentColor, size: 18),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: const TextStyle(
              fontSize: 11,
              color: Color(0xFF64748B),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _ChartPlaceholder extends StatelessWidget {
  final String title;
  const _ChartPlaceholder({required this.title});

  @override
  Widget build(BuildContext context) {
    return _ChartCard(
      title: title,
      child: const SizedBox(
        height: 200,
        child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
      ),
    );
  }
}

class _ChartEmpty extends StatelessWidget {
  final String title;
  const _ChartEmpty({required this.title});

  @override
  Widget build(BuildContext context) {
    return _ChartCard(
      title: title,
      child: const SizedBox(
        height: 160,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.bar_chart_rounded, size: 36, color: Color(0xFFCBD5E1)),
              SizedBox(height: 8),
              Text(
                'No data available yet',
                style: TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ChartError extends StatelessWidget {
  final String title;
  final Object error;
  const _ChartError({required this.title, required this.error});

  @override
  Widget build(BuildContext context) {
    return _ChartCard(
      title: title,
      child: SizedBox(
        height: 160,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline_rounded,
                  size: 36, color: Color(0xFFCBD5E1)),
              const SizedBox(height: 8),
              const Text(
                'Unable to load data',
                style: TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ChartCard extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget child;

  const _ChartCard({required this.title, this.subtitle, required this.child});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: AppTheme.cardDecoration(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1E293B),
                  ),
                ),
                if (subtitle != null)
                  Text(
                    subtitle!,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF94A3B8),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            child,
          ],
        ),
      ),
    );
  }
}

class _RevenueLineChart extends StatelessWidget {
  final List<dynamic> data;
  const _RevenueLineChart({required this.data});

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) return const SizedBox.shrink();

    final spots = <FlSpot>[];
    double maxVal = 0;
    for (int i = 0; i < data.length; i++) {
      final val = double.tryParse(data[i]['revenue'].toString()) ?? 0;
      spots.add(FlSpot(i.toDouble(), val));
      if (val > maxVal) maxVal = val;
    }

    return _ChartCard(
      title: 'Revenue Trend',
      subtitle: 'Last 7 days',
      child: SizedBox(
        height: 220,
        child: LineChart(
          LineChartData(
            gridData: FlGridData(
              show: true,
              drawVerticalLine: false,
              horizontalInterval: maxVal > 0 ? maxVal / 4 : 1,
              getDrawingHorizontalLine: (value) => FlLine(
                color: const Color(0xFFF1F5F9),
                strokeWidth: 1,
              ),
            ),
            titlesData: FlTitlesData(
              leftTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 50,
                  getTitlesWidget: (value, meta) => Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: Text(
                      CurrencyFormatter.format(value),
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 10,
                      ),
                    ),
                  ),
                ),
              ),
              rightTitles:
                  const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              topTitles:
                  const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              bottomTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  getTitlesWidget: (value, meta) {
                    if (value.toInt() >= data.length)
                      return const SizedBox.shrink();
                    final dateStr = data[value.toInt()]['date'] as String?;
                    if (dateStr == null) return const SizedBox.shrink();
                    return Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        DateFormat('EEE').format(DateTime.parse(dateStr)),
                        style: const TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
            borderData: FlBorderData(show: false),
            minX: 0,
            maxX: (data.length - 1).toDouble(),
            minY: 0,
            maxY: maxVal > 0 ? maxVal * 1.2 : 1,
            lineBarsData: [
              LineChartBarData(
                spots: spots,
                isCurved: true,
                curveSmoothness: 0.35,
                color: const Color(0xFFF97316),
                barWidth: 3,
                dotData: FlDotData(
                  show: true,
                  getDotPainter: (_, __, ___, ____) => FlDotCirclePainter(
                    radius: 4,
                    color: Colors.white,
                    strokeWidth: 2.5,
                    strokeColor: const Color(0xFFF97316),
                  ),
                ),
                belowBarData: BarAreaData(
                  show: true,
                  gradient: LinearGradient(
                    colors: [
                      const Color(0xFFF97316).withValues(alpha: 0.2),
                      const Color(0xFFF97316).withValues(alpha: 0.0),
                    ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
              ),
            ],
            lineTouchData: LineTouchData(
              touchTooltipData: LineTouchTooltipData(
                getTooltipColor: (_) => const Color(0xFF1E293B),
                tooltipRoundedRadius: 8,
                getTooltipItems: (spots) => spots.map((spot) {
                  return LineTooltipItem(
                    CurrencyFormatter.format(spot.y),
                    const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _OrdersBarChart extends StatelessWidget {
  final List<dynamic> data;
  const _OrdersBarChart({required this.data});

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) return const SizedBox.shrink();

    int maxVal = 0;
    for (final item in data) {
      final count = item['count'] as int? ?? 0;
      if (count > maxVal) maxVal = count;
    }

    return _ChartCard(
      title: 'Orders Overview',
      subtitle: 'Last 7 days',
      child: SizedBox(
        height: 220,
        child: BarChart(
          BarChartData(
            alignment: BarChartAlignment.spaceAround,
            maxY: (maxVal * 1.3).toDouble().clamp(1, double.infinity),
            barTouchData: BarTouchData(
              touchTooltipData: BarTouchTooltipData(
                getTooltipColor: (_) => const Color(0xFF1E293B),
                tooltipRoundedRadius: 8,
                getTooltipItem: (group, groupIndex, rod, rodIndex) {
                  return BarTooltipItem(
                    '${rod.toY.toInt()} orders',
                    const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  );
                },
              ),
            ),
            titlesData: FlTitlesData(
              leftTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 30,
                  getTitlesWidget: (value, meta) => Text(
                    '${value.toInt()}',
                    style: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 10,
                    ),
                  ),
                ),
              ),
              rightTitles:
                  const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              topTitles:
                  const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              bottomTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  getTitlesWidget: (value, meta) {
                    if (value.toInt() >= data.length)
                      return const SizedBox.shrink();
                    final dateStr = data[value.toInt()]['date'] as String?;
                    if (dateStr == null) return const SizedBox.shrink();
                    return Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        DateFormat('EEE').format(DateTime.parse(dateStr)),
                        style: const TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
            gridData: FlGridData(
              show: true,
              drawVerticalLine: false,
              horizontalInterval: maxVal > 0 ? maxVal / 4 : 1,
              getDrawingHorizontalLine: (value) => FlLine(
                color: const Color(0xFFF1F5F9),
                strokeWidth: 1,
              ),
            ),
            borderData: FlBorderData(show: false),
            barGroups: data.asMap().entries.map((entry) {
              return BarChartGroupData(
                x: entry.key,
                barRods: [
                  BarChartRodData(
                    toY: (entry.value['count'] as int? ?? 0).toDouble(),
                    gradient: const LinearGradient(
                      colors: [Color(0xFF3B82F6), Color(0xFF60A5FA)],
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                    ),
                    width: 20,
                    borderRadius:
                        const BorderRadius.vertical(top: Radius.circular(6)),
                  ),
                ],
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

class _StatusPieChart extends StatelessWidget {
  final List<dynamic> data;
  const _StatusPieChart({required this.data});

  static const _statusColors = {
    'DELIVERED': Color(0xFF10B981),
    'READY': Color(0xFF3B82F6),
    'PREPARING': Color(0xFFF97316),
    'ACCEPTED': Color(0xFF8B5CF6),
    'PENDING': Color(0xFFEAB308),
    'CANCELLED': Color(0xFFEF4444),
  };

  static const _statusLabels = {
    'DELIVERED': 'Delivered',
    'READY': 'Ready',
    'PREPARING': 'Preparing',
    'ACCEPTED': 'Accepted',
    'PENDING': 'Pending',
    'CANCELLED': 'Cancelled',
  };

  @override
  Widget build(BuildContext context) {
    final total =
        data.fold<int>(0, (sum, item) => sum + ((item['count'] as int?) ?? 0));

    return _ChartCard(
      title: 'Order Status',
      subtitle: 'All time',
      child: SizedBox(
        height: 280,
        child: Row(
          children: [
            SizedBox(
              width: 180,
              height: 180,
              child: PieChart(
                PieChartData(
                  sectionsSpace: 3,
                  centerSpaceRadius: 45,
                  sections: data.map((item) {
                    final status = item['status'] as String;
                    final count = (item['count'] as int?) ?? 0;
                    final color =
                        _statusColors[status] ?? const Color(0xFF94A3B8);
                    return PieChartSectionData(
                      color: color,
                      value: count.toDouble(),
                      radius: 18,
                      showTitle: false,
                    );
                  }).toList(),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: data.map((item) {
                  final status = item['status'] as String;
                  final count = (item['count'] as int?) ?? 0;
                  final color =
                      _statusColors[status] ?? const Color(0xFF94A3B8);
                  final pct = total > 0
                      ? ((count / total) * 100).toStringAsFixed(0)
                      : '0';
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Row(
                      children: [
                        Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            color: color,
                            borderRadius: BorderRadius.circular(3),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _statusLabels[status] ?? status,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: Color(0xFF475569),
                            ),
                          ),
                        ),
                        Text(
                          '$pct%',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF1E293B),
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HourlyBarChart extends StatelessWidget {
  final List<dynamic> hours;
  const _HourlyBarChart({required this.hours});

  @override
  Widget build(BuildContext context) {
    if (hours.isEmpty) return const SizedBox.shrink();

    int maxVal = 0;
    for (final h in hours) {
      final count = h['count'] as int? ?? 0;
      if (count > maxVal) maxVal = count;
    }

    return _ChartCard(
      title: 'Peak Hours',
      subtitle: 'Today\'s order distribution',
      child: SizedBox(
        height: 200,
        child: BarChart(
          BarChartData(
            alignment: BarChartAlignment.spaceAround,
            maxY: (maxVal * 1.3).toDouble().clamp(1, double.infinity),
            barTouchData: BarTouchData(
              touchTooltipData: BarTouchTooltipData(
                getTooltipColor: (_) => const Color(0xFF1E293B),
                tooltipRoundedRadius: 8,
                getTooltipItem: (group, groupIndex, rod, rodIndex) {
                  final hour = hours[group.x.toInt()]['hour'] as int? ?? 0;
                  return BarTooltipItem(
                    '$hour:00 - ${rod.toY.toInt()} orders',
                    const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  );
                },
              ),
            ),
            titlesData: FlTitlesData(
              leftTitles:
                  const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              rightTitles:
                  const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              topTitles:
                  const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              bottomTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  getTitlesWidget: (value, meta) {
                    if (value.toInt() >= hours.length)
                      return const SizedBox.shrink();
                    final hour = hours[value.toInt()]['hour'] as int? ?? 0;
                    return Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        '${hour}h',
                        style: const TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
            gridData: const FlGridData(show: false),
            borderData: FlBorderData(show: false),
            barGroups: hours.asMap().entries.map((entry) {
              final count = (entry.value['count'] as int?) ?? 0;
              return BarChartGroupData(
                x: entry.key,
                barRods: [
                  BarChartRodData(
                    toY: count.toDouble(),
                    gradient: const LinearGradient(
                      colors: [Color(0xFF8B5CF6), Color(0xFFA78BFA)],
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                    ),
                    width: 14,
                    borderRadius:
                        const BorderRadius.vertical(top: Radius.circular(4)),
                  ),
                ],
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

class _TopItemsList extends StatelessWidget {
  final List<dynamic> items;
  const _TopItemsList({required this.items});

  static const _medalColors = [
    Color(0xFFFBBF24),
    Color(0xFF94A3B8),
    Color(0xFFCD7F32),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: AppTheme.cardDecoration(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Top Selling Items',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1E293B),
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Best performers',
              style: TextStyle(
                fontSize: 12,
                color: Color(0xFF94A3B8),
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 16),
            ...items.take(5).toList().asMap().entries.map((entry) {
              final index = entry.key;
              final item = entry.value;
              final maxCount = (items.first['count'] as int?) ?? 1;
              final count = (item['count'] as int?) ?? 0;
              final revenue = double.tryParse(item['revenue'].toString()) ?? 0;
              final pct = (count / maxCount).clamp(0.0, 1.0);

              return Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            color: index < 3
                                ? _medalColors[index].withValues(alpha: 0.15)
                                : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Center(
                            child: Text(
                              '${index + 1}',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: index < 3
                                    ? _medalColors[index]
                                    : const Color(0xFF64748B),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item['name'] ?? '',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF1E293B),
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '$count sold · ${CurrencyFormatter.format(revenue)}',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF94A3B8),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: pct,
                        minHeight: 6,
                        backgroundColor: const Color(0xFFF1F5F9),
                        valueColor: const AlwaysStoppedAnimation<Color>(
                          Color(0xFFF97316),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
