// material-ui
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

// third-party
import { FormikErrors, FormikTouched } from 'formik';
import { useIntl } from 'react-intl';

// project-imports
import { BankAccount, CreateEventPayload } from 'types/organizer';

interface StepPayoutProps {
  values: BankAccount;
  setValues: (bank: BankAccount) => void;
  touched: FormikTouched<CreateEventPayload>;
  errors: FormikErrors<CreateEventPayload>;
}

export default function StepPayout({ values, setValues, touched, errors }: StepPayoutProps) {
  const intl = useIntl();

  const handleChange = (field: keyof BankAccount, value: string) => {
    setValues({ ...values, [field]: value });
  };

  const payoutTouched = touched.payoutInfo as FormikTouched<BankAccount> | undefined;
  const payoutErrors = errors.payoutInfo as FormikErrors<BankAccount> | undefined;

  return (
    <Grid container spacing={3}>
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
