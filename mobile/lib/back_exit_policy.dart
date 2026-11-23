bool shouldExitOnBack(DateTime? previousPress, DateTime currentPress) {
  if (previousPress == null || currentPress.isBefore(previousPress)) return false;
  return currentPress.difference(previousPress) <= const Duration(seconds: 2);
}
