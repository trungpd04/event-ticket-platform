import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, required this.onLogout});

  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Tài khoản', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700)),
            const SizedBox(height: 28),
            Container(padding: const EdgeInsets.all(18), decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(18)), child: const Row(children: [CircleAvatar(radius: 28, backgroundColor: Color(0x33C14FE6), child: Icon(Icons.verified_user, color: AppColors.primary)), SizedBox(width: 14), Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Nhân viên soát vé', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)), Text('Checker', style: TextStyle(color: AppColors.muted))])])),
            const SizedBox(height: 18),
            ListTile(leading: const Icon(Icons.help_outline, color: AppColors.muted), title: const Text('Trợ giúp'), trailing: const Icon(Icons.chevron_right, color: AppColors.muted), onTap: () {}),
            ListTile(leading: const Icon(Icons.logout, color: AppColors.error), title: const Text('Đăng xuất', style: TextStyle(color: AppColors.error)), onTap: onLogout),
          ]),
        ),
      );
}
