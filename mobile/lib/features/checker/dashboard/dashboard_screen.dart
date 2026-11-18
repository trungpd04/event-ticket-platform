import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_client.dart';
import '../../../core/widgets/brand_mark.dart';
import '../../../core/widgets/empty_state.dart';
import 'widgets/event_card.dart';
import 'widgets/stat_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key, required this.token, required this.checkedIn});

  final String token;
  final List<Map<String, dynamic>> checkedIn;

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<List<dynamic>> events;

  @override
  void initState() {
    super.initState();
    events = _loadEvents();
  }

  Future<List<dynamic>> _loadEvents() async {
    final data = await ApiClient(token: widget.token).get('/api/v1/checkers/my-events');
    return data as List<dynamic>;
  }

  Future<void> refresh() async => setState(() => events = _loadEvents());

  @override
  Widget build(BuildContext context) => SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: refresh,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
            children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const BrandMark(),
                CircleAvatar(backgroundColor: AppColors.primary.withOpacity(.18), child: const Icon(Icons.verified_user_outlined, color: AppColors.primary)),
              ]),
              const SizedBox(height: 34),
              const Text('Xin chào, Checker 👋', style: TextStyle(color: AppColors.muted, fontSize: 15)),
              const SizedBox(height: 5),
              const Text('Sẵn sàng cho sự kiện hôm nay?', style: TextStyle(fontSize: 25, fontWeight: FontWeight.w700)),
              const SizedBox(height: 24),
              Row(children: [
                StatCard(label: 'Vé đã quét', value: '${widget.checkedIn.length}', icon: Icons.check_circle_outline, color: AppColors.success),
                const SizedBox(width: 12),
                FutureBuilder<List<dynamic>>(future: events, builder: (context, snapshot) => StatCard(label: 'Sự kiện', value: '${snapshot.data?.length ?? '—'}', icon: Icons.event_outlined, color: AppColors.primary)),
              ]),
              const SizedBox(height: 30),
              const Text('Sự kiện được phân công', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              FutureBuilder<List<dynamic>>(
                future: events,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) return const Padding(padding: EdgeInsets.all(30), child: Center(child: CircularProgressIndicator(color: AppColors.primary)));
                  if (snapshot.hasError) return const EmptyState(icon: Icons.cloud_off_outlined, text: 'Không thể tải danh sách sự kiện');
                  final list = snapshot.data ?? [];
                  if (list.isEmpty) return const EmptyState(icon: Icons.event_busy_outlined, text: 'Chưa có sự kiện được phân công');
                  return Column(children: list.map((item) => EventCard(event: item as Map<String, dynamic>)).toList());
                },
              ),
            ],
          ),
        ),
      );
}
