import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/formatters.dart';

class EventCard extends StatelessWidget {
  const EventCard({super.key, required this.event});

  final Map<String, dynamic> event;

  @override
  Widget build(BuildContext context) {
    final title = event['title'] ?? 'Sự kiện chưa đặt tên';
    final location = event['location'] ?? 'Chưa cập nhật địa điểm';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.white.withOpacity(.05))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(width: 44, height: 44, decoration: BoxDecoration(color: AppColors.primary.withOpacity(.18), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.celebration_outlined, color: AppColors.primary)),
          const SizedBox(width: 12),
          Expanded(child: Text('$title', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16))),
          const Icon(Icons.chevron_right, color: AppColors.muted),
        ]),
        const SizedBox(height: 14),
        Row(children: [const Icon(Icons.place_outlined, size: 17, color: AppColors.muted), const SizedBox(width: 6), Expanded(child: Text('$location', style: const TextStyle(color: AppColors.muted, fontSize: 13)))]),
        const SizedBox(height: 8),
        Row(children: [const Icon(Icons.schedule_outlined, size: 17, color: AppColors.muted), const SizedBox(width: 6), Text(formatEventDate(event['startTime']), style: const TextStyle(color: AppColors.muted, fontSize: 13))]),
      ]),
    );
  }
}
