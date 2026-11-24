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
    expect(html, contains('Board exam simulations'));
    expect(html, contains('practice simulations—not official papers'));
    expect(html, contains('id="exam-timer"'));
    expect(html, contains('id="review-dialog"'));
    expect(html, isNot(contains('reflection-fieldset')));
    expect(html.indexOf('assets/open-pharmacy-questions.js'), lessThan(html.indexOf('app.js')));
    expect(script, contains('window.MedQuoraWidget'));
    expect(script, contains('function updateExamTimer'));
    expect(script, contains('function renderReview'));
    expect(script, isNot(contains('name="reflection"')));
    expect(questionData, hasLength(326));
    expect(ids, hasLength(326));
    expect(prompts, hasLength(326));
    for (final item in questionData.cast<Map<String, dynamic>>()) {
      final options = item['options'] as List<dynamic>;
      expect(options.any((option) => (option as List<dynamic>).first == item['answer']), isTrue);
    }
    expect(license, contains('MIT License'));
    expect(license, contains('Copyright (c) 2026 rocksonsamuel96'));
    expect(logo.lengthInBytes, greaterThan(0));
  });
}
