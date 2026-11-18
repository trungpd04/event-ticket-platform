import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'features/auth/auth_gate.dart';

class LetTicketApp extends StatelessWidget {
  const LetTicketApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'LetTicket Checker',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.dark,
        home: const AuthGate(),
      );
}
