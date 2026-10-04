// third-party
import { useIntl } from 'react-intl';

// material-ui
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';

// ==============================|| SAMPLE PAGE ||============================== //

export default function SamplePage() {
  const intl = useIntl();

  return (
    <MainCard title={intl.formatMessage({ id: 'samplePage.title' })}>
      <Typography variant="body1">{intl.formatMessage({ id: 'samplePage.body' })}</Typography>
    </MainCard>
  );
}
