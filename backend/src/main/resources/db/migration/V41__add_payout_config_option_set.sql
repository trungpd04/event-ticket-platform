-- Payout configuration option set
-- Values can be changed at runtime via the admin option-set management API.
-- If a value is missing or blank, the backend falls back to its hard-coded default.

INSERT INTO option_sets (code, name, description, status)
VALUES ('PAYOUT_CONFIG', 'Cấu hình thanh toán đối tác', 'Cấu hình thờ gian chờ và số tiền tối thiểu cho yêu cầu thanh toán', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

INSERT INTO option_set_values (option_set_id, code, name, value, sort_order, status)
VALUES (
    (SELECT id FROM option_sets WHERE code = 'PAYOUT_CONFIG'),
    'HOLD_DAYS',
    'Số ngày chờ sau khi sự kiện kết thúc',
    '7',
    1,
    'ACTIVE'
)
ON CONFLICT (option_set_id, code) DO NOTHING;

INSERT INTO option_set_values (option_set_id, code, name, value, sort_order, status)
VALUES (
    (SELECT id FROM option_sets WHERE code = 'PAYOUT_CONFIG'),
    'MIN_AMOUNT',
    'Số tiền tối thiểu để yêu cầu thanh toán (VND)',
    '100000',
    2,
    'ACTIVE'
)
ON CONFLICT (option_set_id, code) DO NOTHING;
