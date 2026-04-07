import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/dashboard/presentation/screens/dashboard_screen.dart';
import '../../features/orders/presentation/screens/orders_screen.dart';
import '../../features/orders/presentation/screens/order_detail_screen.dart';
import '../../features/menu/presentation/screens/menu_screen.dart';
import '../../features/menu/presentation/screens/menu_item_form_screen.dart';
import '../../features/menu/presentation/screens/categories_screen.dart';
import '../../features/payments/presentation/screens/payments_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/profile/presentation/screens/qr_code_screen.dart';
import '../storage/auth_storage.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authStorage = AuthStorage();

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) async {
      final isLoggedIn = await authStorage.isLoggedIn();
      final isLoginRoute = state.matchedLocation == '/login';

      if (!isLoggedIn && !isLoginRoute) return '/login';
      if (isLoggedIn && isLoginRoute) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) {
          return MainScaffold(child: child);
        },
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/orders',
            builder: (context, state) => const OrdersScreen(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (context, state) => OrderDetailScreen(
                  orderId: state.pathParameters['id']!,
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/menu',
            builder: (context, state) => const MenuScreen(),
            routes: [
              GoRoute(
                path: 'add',
                builder: (context, state) => const MenuItemFormScreen(),
              ),
              GoRoute(
                path: 'edit/:id',
                builder: (context, state) => MenuItemFormScreen(
                  menuItemId: state.pathParameters['id'],
                ),
              ),
              GoRoute(
                path: 'categories',
                builder: (context, state) => const CategoriesScreen(),
              ),
            ],
          ),
          GoRoute(
            path: '/payments',
            builder: (context, state) => const PaymentsScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: '/qr-code',
            builder: (context, state) => const QrCodeScreen(),
          ),
        ],
      ),
    ],
  );
});

class MainScaffold extends StatelessWidget {
  final Widget child;

  const MainScaffold({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final currentIndex = _getCurrentIndex(context);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: currentIndex,
          onTap: (index) {
            switch (index) {
              case 0:
                context.go('/dashboard');
                break;
              case 1:
                context.go('/orders');
                break;
              case 2:
                context.go('/menu');
                break;
              case 3:
                context.go('/payments');
                break;
              case 4:
                context.go('/profile');
                break;
            }
          },
          type: BottomNavigationBarType.fixed,
          selectedItemColor: const Color(0xFFF97316),
          unselectedItemColor: const Color(0xFF94A3B8),
          backgroundColor: Colors.transparent,
          elevation: 0,
          selectedFontSize: 10,
          unselectedFontSize: 10,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined, size: 22),
              activeIcon: Icon(Icons.dashboard_rounded, size: 22),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.receipt_long_outlined, size: 22),
              activeIcon: Icon(Icons.receipt_long_rounded, size: 22),
              label: 'Orders',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.restaurant_menu_outlined, size: 22),
              activeIcon: Icon(Icons.restaurant_menu_rounded, size: 22),
              label: 'Menu',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.payment_outlined, size: 22),
              activeIcon: Icon(Icons.payment_rounded, size: 22),
              label: 'Payments',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline_rounded, size: 22),
              activeIcon: Icon(Icons.person_rounded, size: 22),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }

  int _getCurrentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location == '/dashboard') return 0;
    if (location.startsWith('/orders')) return 1;
    if (location.startsWith('/menu')) return 2;
    if (location.startsWith('/payments')) return 3;
    if (location.startsWith('/profile')) return 4;
    return 0;
  }
}
