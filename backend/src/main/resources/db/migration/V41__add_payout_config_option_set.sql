-- Payout configuration option set
-- Values can be changed at runtime via the admin option-set management API.
-- If a value is missing or blank, the backend falls back to its hard-coded default.

INSERT INTO option_sets (code, name, description, status)
VALUES ('PAYOUT_CONFIG', 'Cấu hình thanh toán đối tác', 'Cấu hình thờ gian chờ cho yêu cầu thanh toán', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

INSERT INTO option_set_values (option_set_id, code, name, value, sort_order, status)
VALUES (
    (SELECT id FROM option_sets WHERE code = 'PAYOUT_CONFIG'),
    'HOLD_DAYS',
    'Số ngày chờ trước khi cho phép yêu cầu thanh toán',
    '14',
    1,
    'ACTIVE'
)
ON CONFLICT (option_set_id, code) DO NOTHING;
