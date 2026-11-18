
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_client.dart';
import '../../../core/utils/formatters.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({
    super.key,
    required this.token,
    required this.onCheckedIn,
  });

  final String token;
  final ValueChanged<Map<String, dynamic>> onCheckedIn;

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final controller = MobileScannerController();
  final manualCode = TextEditingController();

  bool busy = false;
  bool handled = false;

  @override
  void dispose() {
    controller.dispose();
    manualCode.dispose();
    super.dispose();
  }

  Future<void> submit(String code) async {
    if (busy || code.trim().isEmpty) return;

    setState(() {
      busy = true;
      handled = true;
    });

    try {
      final response = await ApiClient(token: widget.token).post(
        path: '/api/v1/check-in',
        body: {'qrCode': code.trim()},
      );

      final item = response['data'] as Map<String, dynamic>;
      widget.onCheckedIn(item);

      if (mounted) showResult(item, success: true);
    } catch (error) {
      if (mounted) {
        showResult(
          {'message': readableError(error)},
          success: false,
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          busy = false;
          handled = false;
        });
      }
    }
  }

  void _handleDetection(BarcodeCapture capture) {
    if (handled || capture.barcodes.isEmpty) return;

    final value = capture.barcodes.first.rawValue;

    if (value != null && value.isNotEmpty) {
      submit(value);
    }
  }

  void showResult(
      Map<String, dynamic> item, {
        required bool success,
      }) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(26),
          topRight: Radius.circular(26),
        ),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(24, 28, 24, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              success ? Icons.check_circle : Icons.cancel,
              color: success ? AppColors.success : AppColors.error,
              size: 64,
            ),
            const SizedBox(height: 14),
            Text(
              success ? 'Check-in thành công!' : 'Không thể check-in',
              style: const TextStyle(
                fontSize: 21,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              success
                  ? '${item['eventName'] ?? 'Vé hợp lệ'}\n${item['ticketTypeName'] ?? ''}'
                  : '${item['message']}',
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.muted,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 22),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => Navigator.pop(context),
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.primary,
                ),
                child: const Text('Tiếp tục quét'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) => SafeArea(
    child: Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
          child: Row(
            children: [
              const Expanded(
                child: Text(
                  'Quét vé',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              IconButton(
                onPressed: () => controller.toggleTorch(),
                icon: const Icon(Icons.flash_on_outlined),
              ),
            ],
          ),
        ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 20),
          child: Text(
            'Đưa mã QR của khách vào khung để xác nhận vé',
            style: TextStyle(color: AppColors.muted),
          ),
        ),
        const SizedBox(height: 24),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  MobileScanner(
                    controller: controller,
                    onDetect: _handleDetection,
                  ),
                  Center(
                    child: Container(
                      width: 250,
                      height: 250,
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: AppColors.primary,
                          width: 3,
                        ),
                        borderRadius: BorderRadius.circular(24),
                      ),
                    ),
                  ),
                  if (busy)
                    Container(
                      color: Colors.black54,
                      child: const Center(
                        child: CircularProgressIndicator(
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 18),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: manualCode,
                  decoration: const InputDecoration(
                    hintText: 'Hoặc nhập mã QR',
                    prefixIcon: Icon(Icons.keyboard_outlined),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Material(
                color: busy ? AppColors.muted : AppColors.primary,
                borderRadius: BorderRadius.circular(14),
                child: InkWell(
                  onTap: busy ? null : () => submit(manualCode.text),
                  borderRadius: BorderRadius.circular(14),
                  child: const Padding(
                    padding: EdgeInsets.all(16),
                    child: Icon(
                      Icons.arrow_forward,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}
