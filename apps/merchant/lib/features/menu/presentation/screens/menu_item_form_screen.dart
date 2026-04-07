import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/menu_repository.dart';

final categoriesProvider = FutureProvider<List<dynamic>>((ref) {
  return ref.read(menuRepositoryProvider).getCategories();
});

class MenuItemFormScreen extends ConsumerStatefulWidget {
  final String? menuItemId;

  const MenuItemFormScreen({super.key, this.menuItemId});

  @override
  ConsumerState<MenuItemFormScreen> createState() => _MenuItemFormScreenState();
}

class _MenuItemFormScreenState extends ConsumerState<MenuItemFormScreen> {
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _prepTimeController = TextEditingController();
  String? _categoryId;
  bool _saving = false;

  @override
  Widget build(BuildContext context) {
    final categories = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.menuItemId != null ? 'Edit Item' : 'Add Item'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _SectionHeader(
              icon: Icons.info_outline_rounded,
              title: 'Basic Information',
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Item Name *',
                prefixIcon: Icon(Icons.restaurant_rounded, size: 20),
              ),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Description',
                prefixIcon: Icon(Icons.description_outlined, size: 20),
                alignLabelWithHint: true,
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 24),
            _SectionHeader(
              icon: Icons.attach_money_rounded,
              title: 'Pricing & Details',
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _priceController,
              decoration: const InputDecoration(
                labelText: 'Price *',
                prefixText: '\$ ',
                prefixIcon: Icon(Icons.payments_outlined, size: 20),
              ),
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _prepTimeController,
              decoration: const InputDecoration(
                labelText: 'Prep Time (minutes)',
                prefixIcon: Icon(Icons.timer_outlined, size: 20),
                suffixText: 'min',
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 14),
            categories.when(
              data: (cats) => DropdownButtonFormField<String>(
                value: _categoryId,
                decoration: const InputDecoration(
                  labelText: 'Category *',
                  prefixIcon: Icon(Icons.category_outlined, size: 20),
                ),
                items: cats
                    .map((cat) => DropdownMenuItem<String>(
                          value: cat['id'] as String,
                          child: Text(cat['name'] as String),
                        ))
                    .toList(),
                onChanged: (value) => setState(() => _categoryId = value),
              ),
              loading: () => const LinearProgressIndicator(),
              error: (_, __) => const Text('Error loading categories'),
            ),
            const SizedBox(height: 36),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: _saving
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: Colors.white,
                        ),
                      )
                    : Text(
                        widget.menuItemId != null ? 'Update Item' : 'Add Item',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _save() async {
    if (_nameController.text.isEmpty ||
        _priceController.text.isEmpty ||
        _categoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all required fields')),
      );
      return;
    }

    setState(() => _saving = true);

    try {
      final data = {
        'name': _nameController.text,
        'description': _descriptionController.text.isEmpty
            ? null
            : _descriptionController.text,
        'price': double.parse(_priceController.text),
        'prepTime': _prepTimeController.text.isEmpty
            ? null
            : int.parse(_prepTimeController.text),
        'categoryId': _categoryId,
      };

      final repo = ref.read(menuRepositoryProvider);
      if (widget.menuItemId != null) {
        await repo.updateMenuItem(widget.menuItemId!, data);
      } else {
        await repo.createMenuItem(data);
      }

      if (mounted) context.go('/menu');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }
}

class _SectionHeader extends StatelessWidget {
  final IconData icon;
  final String title;

  const _SectionHeader({required this.icon, required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFFF97316)),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: Color(0xFF1E293B),
          ),
        ),
      ],
    );
  }
}
