import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('bundles branded web app and logo for offline use', () async {
    final html = await rootBundle.loadString('assets/web/index.html');
    final script = await rootBundle.loadString('assets/web/app.js');
    final logo = await rootBundle.load('assets/web/assets/medquora-logo.png');

    expect(html, contains('<title>MedQuora'));
    expect(html, contains('assets/medquora-logo.png'));
    expect(script, contains('window.MedQuoraWidget'));
    expect(logo.lengthInBytes, greaterThan(0));
  });
}
