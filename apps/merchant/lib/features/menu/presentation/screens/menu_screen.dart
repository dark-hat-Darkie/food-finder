import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/menu_repository.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/currency_formatter.dart';

final menuItemsProvider = FutureProvider<List<dynamic>>((ref) {
  return ref.read(menuRepositoryProvider).getMenuItems();
});

class MenuScreen extends ConsumerWidget {
  const MenuScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final menuAsync = ref.watch(menuItemsProvider);

    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/menu/add'),
        child: const Icon(Icons.add_rounded, size: 28),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(menuItemsProvider),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverAppBar(
              floating: true,
              snap: true,
              title: const Text('Menu'),
              actions: [
                IconButton(
                  onPressed: () => context.go('/menu/categories'),
                  icon: const Icon(Icons.category_rounded),
                ),
              ],
            ),
            menuAsync.when(
              data: (items) {
                if (items.isEmpty) {
                  return SliverFillRemaining(
                    hasScrollBody: false,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.restaurant_menu_rounded,
                              size: 64, color: Colors.grey.shade300),
                          const SizedBox(height: 16),
                          const Text(
                            'No menu items yet',
                            style: TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Tap + to add your first item',
                            style: TextStyle(
                              color: Color(0xFFCBD5E1),
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }
                return SliverPadding(
                  padding: const EdgeInsets.fromLTRB(20, 4, 20, 80),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => _MenuItemCard(item: items[index]),
                      childCount: items.length,
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
          ],
        ),
      ),
    );
  }
}

class _MenuItemCard extends ConsumerWidget {
  final Map<String, dynamic> item;

  const _MenuItemCard({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAvailable = item['isAvailable'] as bool;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: AppTheme.cardDecoration(),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.go('/menu/edit/${item['id']}'),
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: isAvailable
                          ? [
                              const Color(0xFFF97316).withValues(alpha: 0.15),
                              const Color(0xFFFB923C).withValues(alpha: 0.08),
                            ]
                          : [
                              Colors.grey.shade200,
                              Colors.grey.shade100,
                            ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    Icons.lunch_dining_rounded,
                    color: isAvailable
                        ? const Color(0xFFF97316)
                        : Colors.grey.shade400,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              item['name'],
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 15,
                                color: isAvailable
                                    ? const Color(0xFF1E293B)
                                    : Colors.grey.shade500,
                              ),
                            ),
                          ),
                          SizedBox(
                            width: 44,
                            height: 26,
                            child: FittedBox(
                              child: Switch(
                                value: isAvailable,
                                onChanged: (value) async {
                                  await ref
                                      .read(menuRepositoryProvider)
                                      .updateMenuItem(
                                    item['id'],
                                    {'isAvailable': value},
                                  );
                                  ref.invalidate(menuItemsProvider);
                                },
                                activeColor: const Color(0xFF10B981),
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (item['description'] != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 3),
                          child: Text(
                            item['description'],
                            style: const TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 12,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Text(
                            CurrencyFormatter.format(
                                double.tryParse(item['price'].toString()) ?? 0),
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              color: Color(0xFFF97316),
                              fontSize: 14,
                            ),
                          ),
                          if (item['category'] != null) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                item['category']['name'],
                                style: const TextStyle(
                                  color: Color(0xFF64748B),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ],
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
