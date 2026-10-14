INSERT INTO option_sets (code, name, description, status)
SELECT 'RESERVATION_CONFIG',
       'Cấu hình giữ vé',
       'Các cấu hình áp dụng cho luồng giữ vé',
       'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM option_sets WHERE code = 'RESERVATION_CONFIG'
);

INSERT INTO option_set_values (
    option_set_id, code, name, value, color, sort_order, status
)
SELECT id,
       'RESERVATION_MINUTES',
       'Số phút giữ vé',
       '10',
       NULL,
       1,
       'ACTIVE'
FROM option_sets
WHERE code = 'RESERVATION_CONFIG'
  AND NOT EXISTS (
      SELECT 1
      FROM option_set_values
      WHERE option_set_id = option_sets.id
        AND code = 'RESERVATION_MINUTES'
  );
