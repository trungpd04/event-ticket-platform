import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/empty_state.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key, required this.items});

  final List<Map<String, dynamic>> items;

  @override
  Widget build(BuildContext context) => SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const Text('Lịch sử check-in', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            const Text('Các vé đã được xác nhận trong phiên này', style: TextStyle(color: AppColors.muted)),
            const SizedBox(height: 24),
            if (items.isEmpty)
              const EmptyState(icon: Icons.history, text: 'Chưa có lượt check-in nào')
            else
              ...items.map((item) => Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16)),
                    child: Row(children: [
                      const CircleAvatar(backgroundColor: Color(0x2234C759), child: Icon(Icons.check, color: AppColors.success)),
                      const SizedBox(width: 12),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('${item['eventName'] ?? 'Sự kiện'}', style: const TextStyle(fontWeight: FontWeight.w700)), Text('${item['ticketTypeName'] ?? 'Vé'}', style: const TextStyle(color: AppColors.muted, fontSize: 13))])),
                      const Text('Hợp lệ', style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w600)),
                    ]),
                  )),
          ],
        ),
      );
}
