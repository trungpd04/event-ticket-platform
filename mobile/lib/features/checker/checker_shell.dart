import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/constants/app_colors.dart';
import '../auth/auth_gate.dart';
import 'dashboard/dashboard_screen.dart';
import 'history/history_screen.dart';
import 'profile/profile_screen.dart';
import 'scanner/scanner_screen.dart';

class CheckerShell extends StatefulWidget {
  const CheckerShell({super.key, required this.token});

  final String token;

  @override
  State<CheckerShell> createState() => _CheckerShellState();
}

class _CheckerShellState extends State<CheckerShell> {
  int tab = 0;
  final checkedIn = <Map<String, dynamic>>[];

  @override
  Widget build(BuildContext context) {
    final pages = [
      DashboardScreen(token: widget.token, checkedIn: checkedIn),
      ScannerScreen(token: widget.token, onCheckedIn: (item) => setState(() => checkedIn.insert(0, item))),
      HistoryScreen(items: checkedIn),
      ProfileScreen(onLogout: logout),
    ];

    return Scaffold(
      // Chỉ mount màn hình hiện tại. Scanner cần quyền camera và không nên
      // được khởi tạo ngầm khi người dùng đang ở tab khác.
      body: pages[tab],
      bottomNavigationBar: NavigationBar(
        selectedIndex: tab,
        onDestinationSelected: (value) => setState(() => tab = value),
        backgroundColor: AppColors.surface,
        indicatorColor: AppColors.primary.withOpacity(.22),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.grid_view_outlined), selectedIcon: Icon(Icons.grid_view), label: 'Tổng quan'),
          NavigationDestination(icon: Icon(Icons.qr_code_scanner), label: 'Quét vé'),
          NavigationDestination(icon: Icon(Icons.history), label: 'Lịch sử'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Tài khoản'),
        ],
      ),
    );
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const AuthGate()),
      (_) => false,
    );
  }
}
