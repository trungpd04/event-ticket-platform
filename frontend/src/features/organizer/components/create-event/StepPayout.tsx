// material-ui
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

// project-imports
import { BankAccount } from 'types/organizer';

interface StepPayoutProps {
  values: BankAccount;
  setValues: (bank: BankAccount) => void;
}

export default function StepPayout({ values, setValues }: StepPayoutProps) {
  const handleChange = (field: keyof BankAccount, value: string) => {
    setValues({ ...values, [field]: value });
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <TextField
          fullWidth
          label="Bank name"
          value={values.bankName}
          onChange={(e) => handleChange('bankName', e.target.value)}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          label="Account number"
          value={values.accountNumber}
          onChange={(e) => handleChange('accountNumber', e.target.value)}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          label="Account holder"
          value={values.accountHolder}
          onChange={(e) => handleChange('accountHolder', e.target.value)}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          label="Branch"
          value={values.branch}
          onChange={(e) => handleChange('branch', e.target.value)}
        />
      </Grid>
    </Grid>
  );
}
