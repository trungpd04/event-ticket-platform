// material-ui
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { BankAccount } from 'types/organizer';

interface StepPayoutProps {
  values: BankAccount;
  setValues: (bank: BankAccount) => void;
}

export default function StepPayout({ values, setValues }: StepPayoutProps) {
  const intl = useIntl();

  const handleChange = (field: keyof BankAccount, value: string) => {
    setValues({ ...values, [field]: value });
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <TextField
          fullWidth
          label={intl.formatMessage({ id: 'createEvent.bankName' })}
          value={values.bankName}
          onChange={(e) => handleChange('bankName', e.target.value)}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          label={intl.formatMessage({ id: 'createEvent.accountNumber' })}
          value={values.accountNumber}
          onChange={(e) => handleChange('accountNumber', e.target.value)}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          label={intl.formatMessage({ id: 'createEvent.accountHolder' })}
          value={values.accountHolder}
          onChange={(e) => handleChange('accountHolder', e.target.value)}
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
