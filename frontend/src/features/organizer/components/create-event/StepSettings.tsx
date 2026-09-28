// material-ui
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

// project-imports
import { EventSettings } from 'types/organizer';

interface StepSettingsProps {
  values: EventSettings;
  setValues: (settings: EventSettings) => void;
}

export default function StepSettings({ values, setValues }: StepSettingsProps) {
  const handleChange = (field: keyof EventSettings, value: any) => {
    setValues({ ...values, [field]: value });
  };

  const tagString = values.tags.join(', ');

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Refund policy"
          value={values.refundPolicy}
          onChange={(e) => handleChange('refundPolicy', e.target.value)}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          label="Age restriction"
          value={values.ageRestriction}
          onChange={(e) => handleChange('ageRestriction', e.target.value)}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          label="Tags (comma separated)"
          value={tagString}
          onChange={(e) =>
            handleChange(
              'tags',
              e.target.value
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
            )
          }
        />
      </Grid>
      <Grid size={12}>
        <FormControlLabel
          control={
            <Switch
              checked={values.isPublic}
              onChange={(e) => handleChange('isPublic', e.target.checked)}
            />
          }
          label="Public event"
        />
      </Grid>
    </Grid>
  );
}
