UPDATE option_set_values
SET value = '5',
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'RESERVATION_MINUTES'
  AND option_set_id = (
      SELECT id
      FROM option_sets
      WHERE code = 'RESERVATION_CONFIG'
  );
