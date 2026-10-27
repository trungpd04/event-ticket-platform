INSERT INTO option_sets (code, name, description, status)
SELECT 'PAYMENT_CONFIG',
       'Cấu hình thanh toán',
       'Các cấu hình áp dụng cho luồng thanh toán',
       'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM option_sets WHERE code = 'PAYMENT_CONFIG'
);

INSERT INTO option_set_values (option_set_id, code, name, value, color, sort_order, status)
SELECT id,
       'MAX_POLL_COUNT',
       'Số lần poll tối đa',
       '300',
       NULL,
       1,
       'ACTIVE'
FROM option_sets
WHERE code = 'PAYMENT_CONFIG'
  AND NOT EXISTS (
      SELECT 1
      FROM option_set_values
      WHERE option_set_id = option_sets.id
        AND code = 'MAX_POLL_COUNT'
  );

INSERT INTO option_set_values (option_set_id, code, name, value, color, sort_order, status)
SELECT id,
       'FREQUENCE_CALL_API_POLL',
       'Tần suất poll (ms)',
       '3000',
       NULL,
       2,
       'ACTIVE'
FROM option_sets
WHERE code = 'PAYMENT_CONFIG'
  AND NOT EXISTS (
      SELECT 1
      FROM option_set_values
      WHERE option_set_id = option_sets.id
        AND code = 'FREQUENCE_CALL_API_POLL'
  );
