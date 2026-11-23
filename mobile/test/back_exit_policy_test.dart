import 'package:flutter_test/flutter_test.dart';
import 'package:medquora/back_exit_policy.dart';

void main() {
  final firstPress = DateTime(2026, 11, 23, 12);

  test('exits only after a second press within two seconds', () {
    expect(shouldExitOnBack(null, firstPress), isFalse);
    expect(
      shouldExitOnBack(firstPress, firstPress.add(const Duration(seconds: 2))),
      isTrue,
    );
    expect(
      shouldExitOnBack(firstPress, firstPress.add(const Duration(seconds: 3))),
      isFalse,
    );
  });

  test('does not treat a backward clock adjustment as a second press', () {
    expect(
      shouldExitOnBack(firstPress, firstPress.subtract(const Duration(seconds: 1))),
      isFalse,
    );
  });
}
