import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../checker/checker_shell.dart';
import 'login_screen.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  String? token;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    SharedPreferences.getInstance().then((prefs) {
      if (!mounted) return;
      setState(() {
        token = prefs.getString('access_token');
        loading = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (token == null) {
      return LoginScreen(onLoggedIn: (value) => setState(() => token = value));
    }
    return CheckerShell(token: token!);
  }
}
