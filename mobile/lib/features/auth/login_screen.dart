import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/constants/app_colors.dart';
import '../../core/services/api_client.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/brand_mark.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.onLoggedIn});

  final ValueChanged<String> onLoggedIn;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final email = TextEditingController();
  final password = TextEditingController();
  bool busy = false;
  bool obscure = true;

  @override
  void dispose() {
    email.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> login() async {
    if (email.text.trim().isEmpty || password.text.isEmpty) return;
    setState(() => busy = true);
    try {
      final response = await ApiClient().post(path: '/api/v1/auth/login', body: {
        'email': email.text.trim(),
        'password': password.text,
      });
      final accessToken = (response['data'] as Map<String, dynamic>)['accessToken'] as String;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('access_token', accessToken);
      widget.onLoggedIn(accessToken);
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(readableError(error))));
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(28),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 430),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const BrandMark(),
                    const SizedBox(height: 52),
                    const Text('Chào mừng trở lại', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    const Text('Đăng nhập tài khoản checker để bắt đầu soát vé.', style: TextStyle(color: AppColors.muted, fontSize: 15)),
                    const SizedBox(height: 34),
                    const Text('Email', style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(hintText: 'checker@letticket.live', prefixIcon: Icon(Icons.mail_outline))),
                    const SizedBox(height: 18),
                    const Text('Mật khẩu', style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    TextField(controller: password, obscureText: obscure, onSubmitted: (_) => login(), decoration: InputDecoration(hintText: '••••••••', prefixIcon: const Icon(Icons.lock_outline), suffixIcon: IconButton(icon: Icon(obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined), onPressed: () => setState(() => obscure = !obscure)))),
                    const SizedBox(height: 28),
                    SizedBox(width: double.infinity, height: 54, child: FilledButton(onPressed: busy ? null : login, style: FilledButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))), child: busy ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Đăng nhập', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)))),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
}
