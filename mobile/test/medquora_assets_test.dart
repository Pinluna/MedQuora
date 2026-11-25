import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('bundles branded app and attributed pharmacy bank for offline use', () async {
    final html = await rootBundle.loadString('assets/web/index.html');
    final script = await rootBundle.loadString('assets/web/app.js');
    final bank = await rootBundle.loadString('assets/web/assets/open-pharmacy-questions.js');
    final syllabusScript = await rootBundle.loadString('assets/web/assets/syllabus-topics.js');
    final license = await rootBundle.loadString('assets/web/assets/open-pharmacy-license.txt');
    final logo = await rootBundle.load('assets/web/assets/medquora-logo.png');
    final questionData = jsonDecode(
      bank.replaceFirst('window.OpenPharmacyQuestions = ', '').trim().replaceFirst(RegExp(r';$'), ''),
    ) as List<dynamic>;
    final syllabusData = jsonDecode(
      syllabusScript.replaceFirst('window.MedQuoraSyllabus = ', '').trim().replaceFirst(RegExp(r';$'), ''),
    ) as Map<String, dynamic>;
    final ids = questionData.map((item) => (item as Map<String, dynamic>)['id']).toSet();
    final prompts = questionData.map((item) => (item as Map<String, dynamic>)['prompt']).toSet();

    expect(html, contains('<title>MedQuora'));
    expect(html, contains('assets/medquora-logo.png'));
    expect(html, contains('Board exam simulations'));
    expect(html, contains('practice simulations—not official papers'));
    expect(html, contains('id="exam-timer"'));
    expect(html, contains('id="review-dialog"'));
    expect(html, contains('id="history-list"'));
    expect(html, contains('id="stage-grid"'));
    expect(html, contains('Stage 1 and Stage 2 practice'));
    expect(html, contains('data-reset-all'));
    expect(html, isNot(contains('reflection-fieldset')));
    expect(html.indexOf('assets/open-pharmacy-questions.js'), lessThan(html.indexOf('assets/syllabus-topics.js')));
    expect(html.indexOf('assets/syllabus-topics.js'), lessThan(html.indexOf('app.js')));
    expect(script, contains('window.MedQuoraWidget'));
    expect(script, contains('function updateExamTimer'));
    expect(script, contains('function openReview'));
    expect(script, contains('function renderHistory'));
    expect(script, contains('function renderSyllabus'));
    expect(script, contains('function startFocusSession'));
    expect(script, contains('data-focus-path'));
    expect(script, contains('state.history.push'));
    expect(script, isNot(contains('name="reflection"')));
    expect(questionData, hasLength(3870));
    expect(ids, hasLength(3870));
    expect(prompts, hasLength(3870));
    final paperOne = questionData.where((item) => item['paper'] == 'paper-1');
    final paperTwo = questionData.where((item) => item['paper'] == 'paper-2');
    expect(paperOne, hasLength(1824));
    expect(paperTwo, hasLength(2046));
    expect(questionData.where((item) => item['stage'] == 'stage-1'), hasLength(3575));
    expect(questionData.where((item) => item['stage'] == 'stage-2'), hasLength(295));
    expect((syllabusData['stages'] as List<dynamic>), hasLength(2));
    expect((syllabusData['references'] as List<dynamic>), hasLength(30));
    for (final item in questionData.cast<Map<String, dynamic>>()) {
      final options = item['options'] as List<dynamic>;
      expect(options.any((option) => (option as List<dynamic>).first == item['answer']), isTrue);
      expect(item['regions'], isA<List<dynamic>>());
      expect((item['regions'] as List<dynamic>), isNotEmpty);
      expect(item['source'], isA<String>());
      expect(item['source'].toString(), isNotEmpty);
      expect(item['license'], isA<String>());
      expect(item['license'].toString(), isNotEmpty);
    }
    expect(license, contains('MIT License'));
    expect(license, contains('Copyright (c) 2026 rocksonsamuel96'));
    expect(license, contains('MedMCQA'));
    expect(license, contains('Apache-2.0'));
    expect(license, contains('RxQA'));
    expect(license, contains('CC BY 4.0'));
    expect(license, contains('PPB Board Mock Series'));
    expect(logo.lengthInBytes, greaterThan(0));
  });
}
