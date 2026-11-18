import 'package:flutter/material.dart';

import '../constants/app_colors.dart';

class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Column(
          children: [
            const SizedBox(height: 4),
            Icon(icon, color: AppColors.muted, size: 48),
            const SizedBox(height: 12),
            Text(text, style: const TextStyle(color: AppColors.muted)),
          ],
        ),
      );
}
