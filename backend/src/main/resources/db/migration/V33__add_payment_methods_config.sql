INSERT INTO option_sets (code, name, description, status)
SELECT 'PAYMENT_METHODS',
       'Phương thức thanh toán',
       'Danh sách phương thức thanh toán được hỗ trợ',
       'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM option_sets WHERE code = 'PAYMENT_METHODS'
);

INSERT INTO option_set_values (option_set_id, code, name, value, color, sort_order, status)
SELECT id,
       'SEPAY',
       'Chuyển khoản ngân hàng (SePay)',
       'Thanh toán qua QR chuyển khoản, tự động xác nhận qua SePay webhook',
       NULL,
       1,
       'ACTIVE'
FROM option_sets
WHERE code = 'PAYMENT_METHODS'
  AND NOT EXISTS (
      SELECT 1
      FROM option_set_values
      WHERE option_set_id = option_sets.id AND code = 'SEPAY'
  );

INSERT INTO option_set_values (option_set_id, code, name, value, color, sort_order, status)
SELECT id,
       'MOCK',
       'Mock Payment',
       'Phương thức thanh toán giả lập dùng cho dev/test',
       NULL,
       2,
       'ACTIVE'
FROM option_sets
WHERE code = 'PAYMENT_METHODS'
  AND NOT EXISTS (
      SELECT 1
      FROM option_set_values
      WHERE option_set_id = option_sets.id AND code = 'MOCK'
  );
