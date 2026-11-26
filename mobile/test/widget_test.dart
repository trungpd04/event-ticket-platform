import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('opens the LetTicket checker login screen', (tester) async {
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const LetTicketApp());
    await tester.pumpAndSettle();

    expect(find.text('LetTicket'), findsOneWidget);
    expect(find.text('Chào mừng trở lại'), findsOneWidget);
    expect(find.text('Đăng nhập'), findsOneWidget);
  });
}
