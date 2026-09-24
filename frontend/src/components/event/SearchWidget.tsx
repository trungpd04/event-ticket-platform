import { Box, Stack, Typography } from '@mui/material';
import { useIntl } from 'react-intl';

// project-imports
import EventButton from 'components/event/EventButton';
import EventInput from 'components/event/EventInput';

// ==============================|| SEARCH WIDGET ||============================== //

export default function SearchWidget() {
  const intl = useIntl();

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: 1,
        p: 2
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
        <Stack spacing={0.5} flex={1} width="100%">
          <Typography variant="caption" color="text.secondary">
            {intl.formatMessage({ id: 'search.what', defaultMessage: 'What' })}
          </Typography>
          <EventInput placeholder={intl.formatMessage({ id: 'search.what', defaultMessage: 'Search events' })} />
        </Stack>
        <Stack spacing={0.5} flex={1} width="100%">
          <Typography variant="caption" color="text.secondary">
            {intl.formatMessage({ id: 'search.where', defaultMessage: 'Where' })}
          </Typography>
          <EventInput placeholder={intl.formatMessage({ id: 'search.where', defaultMessage: 'Location' })} />
        </Stack>
        <Stack spacing={0.5} flex={1} width="100%">
          <Typography variant="caption" color="text.secondary">
            {intl.formatMessage({ id: 'search.when', defaultMessage: 'When' })}
          </Typography>
          <EventInput placeholder={intl.formatMessage({ id: 'search.when', defaultMessage: 'Date' })} />
        </Stack>
        <EventButton variant="contained" color="primary" sx={{ minWidth: 140, height: 48 }}>
          {intl.formatMessage({ id: 'search.button', defaultMessage: 'Search' })}
        </EventButton>
      </Stack>
    </Box>
  );
}
