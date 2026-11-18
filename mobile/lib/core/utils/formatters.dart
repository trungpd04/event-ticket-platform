String formatEventDate(dynamic value) {
  if (value == null) return 'Chưa cập nhật thời gian';
  final date = DateTime.tryParse('$value');
  if (date == null) return '$value';
  final day = date.day.toString().padLeft(2, '0');
  final month = date.month.toString().padLeft(2, '0');
  final hour = date.hour.toString().padLeft(2, '0');
  final minute = date.minute.toString().padLeft(2, '0');
  return '$day/$month/${date.year} • $hour:$minute';
}

String readableError(Object error) => error.toString().replaceFirst('Exception: ', '');
