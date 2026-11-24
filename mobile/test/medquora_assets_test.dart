import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('bundles branded app and attributed pharmacy bank for offline use', () async {
    final html = await rootBundle.loadString('assets/web/index.html');
    final script = await rootBundle.loadString('assets/web/app.js');
    final bank = await rootBundle.loadString('assets/web/assets/open-pharmacy-questions.js');
    final license = await rootBundle.loadString('assets/web/assets/open-pharmacy-license.txt');
    final logo = await rootBundle.load('assets/web/assets/medquora-logo.png');
    final questionData = jsonDecode(
      bank.replaceFirst('window.OpenPharmacyQuestions = ', '').trim().replaceFirst(RegExp(r';$'), ''),
    ) as List<dynamic>;
    final ids = questionData.map((item) => (item as Map<String, dynamic>)['id']).toSet();
    final prompts = questionData.map((item) => (item as Map<String, dynamic>)['prompt']).toSet();

    expect(html, contains('<title>MedQuora'));
    expect(html, contains('assets/medquora-logo.png'));
    expect(html, contains('not an official PPB paper'));
    expect(html, isNot(contains('2018–2025')));
    expect(html.indexOf('assets/open-pharmacy-questions.js'), lessThan(html.indexOf('app.js')));
    expect(script, contains('window.MedQuoraWidget'));
    expect(RegExp(r'"id": "open-pharmacy-\d{2}"').allMatches(bank).length, 43);
    expect(questionData, hasLength(43));
    expect(ids, hasLength(43));
    expect(prompts, hasLength(43));
    for (final item in questionData.cast<Map<String, dynamic>>()) {
      final options = item['options'] as List<dynamic>;
      expect(options.any((option) => (option as List<dynamic>).first == item['answer']), isTrue);
    }
    expect(license, contains('MIT License'));
    expect(license, contains('Copyright (c) 2026 rocksonsamuel96'));
    expect(logo.lengthInBytes, greaterThan(0));
  });
}
