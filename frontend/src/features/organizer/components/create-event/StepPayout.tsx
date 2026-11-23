// material-ui
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { FormikErrors, FormikTouched } from 'formik';
import { useIntl } from 'react-intl';

// project-imports
import { useEffect, useState } from 'react';
import axios from 'utils/axios';
import { formatCurrency } from 'utils/format';
import { BankAccount, CreateEventPayload } from 'types/organizer';

interface StepPayoutProps {
  values: BankAccount;
  setValues: (bank: BankAccount) => void;
  touched: FormikTouched<CreateEventPayload>;
  errors: FormikErrors<CreateEventPayload>;
}

interface DefaultFeePolicy {
  id: number;
  name: string;
  organizerCommissionRate: number;
  customerFeeRate: number;
  customerFlatFee: number;
  isDefault: boolean;
}

export default function StepPayout({ values, setValues, touched, errors }: StepPayoutProps) {
  const intl = useIntl();
  const [feePolicy, setFeePolicy] = useState<DefaultFeePolicy | null>(null);
  const [feeLoading, setFeeLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/v1/events/fee-policy/default')
      .then((response) => setFeePolicy(response.data as DefaultFeePolicy))
      .catch(() => setFeePolicy(null))
      .finally(() => setFeeLoading(false));
  }, []);

  const handleChange = (field: keyof BankAccount, value: string) => {
    setValues({ ...values, [field]: value });
  };

  const payoutTouched = touched.payoutInfo as FormikTouched<BankAccount> | undefined;
  const payoutErrors = errors.payoutInfo as FormikErrors<BankAccount> | undefined;

  const commissionPercent = Number(feePolicy?.organizerCommissionRate ?? 0) * 100;
  const customerServicePercent = Number(feePolicy?.customerFeeRate ?? 0) * 100;

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                <Stack spacing={0.5}>
                  <Typography variant="h6" fontWeight={700}>
                    {intl.formatMessage({ id: 'createEvent.defaultFeePolicyTitle' })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {intl.formatMessage({ id: 'createEvent.defaultFeePolicyDescription' })}
                  </Typography>
                </Stack>
                {!feeLoading && feePolicy && (
                  <Chip
                    label={feePolicy.name}
                    color="primary"
                    variant="outlined"
                    sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                  />
                )}
              </Stack>

              {feeLoading ? (
                <Typography variant="body2" color="text.secondary">
                  {intl.formatMessage({ id: 'createEvent.defaultFeePolicyLoading' })}
                </Typography>
              ) : feePolicy ? (
                <>
                  <Divider />
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          {intl.formatMessage({ id: 'createEvent.organizerCommissionFee' })}
                        </Typography>
                        <Typography variant="h5" fontWeight={800}>
                          {commissionPercent.toLocaleString(intl.locale, { maximumFractionDigits: 2 })}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {intl.formatMessage({ id: 'createEvent.organizerCommissionHint' })}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          {intl.formatMessage({ id: 'createEvent.customerServiceFee' })}
                        </Typography>
                        <Typography variant="h5" fontWeight={800}>
                          {customerServicePercent.toLocaleString(intl.locale, { maximumFractionDigits: 2 })}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {intl.formatMessage({ id: 'createEvent.customerServiceHint' })}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          {intl.formatMessage({ id: 'createEvent.customerProcessingFee' })}
                        </Typography>
                        <Typography variant="h5" fontWeight={800}>
                          {formatCurrency(Number(feePolicy.customerFlatFee ?? 0), intl.locale)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {intl.formatMessage({ id: 'createEvent.customerProcessingHint' })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Stack>
                </>
              ) : (
                <Alert severity="warning">
                  {intl.formatMessage({ id: 'createEvent.defaultFeePolicyUnavailable' })}
                </Alert>
              )}

              <Alert severity="info">
                {intl.formatMessage({ id: 'createEvent.defaultFeePolicyNoChanges' })}
              </Alert>
              <Typography variant="body2" color="text.secondary">
                {intl.formatMessage({ id: 'createEvent.feePolicyHotline' })}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={12}>
        <TextField
          fullWidth
          label={intl.formatMessage({ id: 'createEvent.bankName' })}
          value={values.bankName}
          onChange={(e) => handleChange('bankName', e.target.value)}
          error={Boolean(payoutTouched?.bankName && payoutErrors?.bankName)}
          helperText={payoutTouched?.bankName && payoutErrors?.bankName}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          label={intl.formatMessage({ id: 'createEvent.accountNumber' })}
          value={values.accountNumber}
          onChange={(e) => handleChange('accountNumber', e.target.value)}
          error={Boolean(payoutTouched?.accountNumber && payoutErrors?.accountNumber)}
          helperText={payoutTouched?.accountNumber && payoutErrors?.accountNumber}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          label={intl.formatMessage({ id: 'createEvent.accountHolder' })}
          value={values.accountHolder}
          onChange={(e) => handleChange('accountHolder', e.target.value)}
          error={Boolean(payoutTouched?.accountHolder && payoutErrors?.accountHolder)}
          helperText={payoutTouched?.accountHolder && payoutErrors?.accountHolder}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          label={intl.formatMessage({ id: 'createEvent.branch' })}
          value={values.branch}
          onChange={(e) => handleChange('branch', e.target.value)}
        />
      </Grid>
    </Grid>
  );
}
