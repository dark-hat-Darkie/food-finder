import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/menu_repository.dart';
import '../../../../core/theme/app_theme.dart';

final categoriesListProvider = FutureProvider<List<dynamic>>((ref) {
  return ref.read(menuRepositoryProvider).getCategories();
});

class CategoriesScreen extends ConsumerStatefulWidget {
  const CategoriesScreen({super.key});

  @override
  ConsumerState<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends ConsumerState<CategoriesScreen> {
  final _nameController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final categories = ref.watch(categoriesListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Categories')),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(categoriesListProvider),
        child: categories.when(
          data: (cats) {
            if (cats.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.category_rounded,
                        size: 64, color: Colors.grey.shade300),
                    const SizedBox(height: 16),
                    const Text(
                      'No categories yet',
                      style: TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: cats.length,
              itemBuilder: (context, index) {
                final cat = cats[index];
                final itemCount = cat['_count']?['menuItems'] ?? 0;
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  decoration: AppTheme.cardDecoration(),
                  child: ListTile(
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    leading: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF97316).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.category_rounded,
                        color: Color(0xFFF97316),
                        size: 20,
                      ),
                    ),
                    title: Text(cat['name'],
                        style: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 14)),
                    subtitle: Text(
                        '$itemCount item${itemCount != 1 ? 's' : ''}',
                        style: const TextStyle(
                            color: Color(0xFF94A3B8), fontSize: 12)),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline_rounded,
                          color: Color(0xFFEF4444)),
                      onPressed: () async {
                        final confirm = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            title: const Text('Delete Category'),
                            content: Text(
                                'Are you sure you want to delete "${cat['name']}"?'),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, false),
                                child: const Text('Cancel'),
                              ),
                              ElevatedButton(
                                onPressed: () => Navigator.pop(ctx, true),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.red,
                                ),
                                child: const Text('Delete'),
                              ),
                            ],
                          ),
                        );
                        if (confirm == true) {
                          await ref
                              .read(menuRepositoryProvider)
                              .deleteCategory(cat['id']);
                          ref.invalidate(categoriesListProvider);
                        }
                      },
                    ),
                  ),
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Error: $e')),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(),
        child: const Icon(Icons.add_rounded, size: 28),
      ),
    );
  }

  void _showAddDialog() {
    _nameController.clear();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFF97316).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.add_rounded,
                  color: Color(0xFFF97316), size: 20),
            ),
            const SizedBox(width: 12),
            const Text('Add Category',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          ],
        ),
        content: TextField(
          controller: _nameController,
          decoration: const InputDecoration(
            labelText: 'Category Name',
            prefixIcon: Icon(Icons.label_outline_rounded, size: 20),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (_nameController.text.isNotEmpty) {
                await ref.read(menuRepositoryProvider).createCategory({
                  'name': _nameController.text,
                });
                _nameController.clear();
                if (mounted) Navigator.pop(context);
                ref.invalidate(categoriesListProvider);
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }
}
