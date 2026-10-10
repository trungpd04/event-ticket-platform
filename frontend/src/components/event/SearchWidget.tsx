import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { Box, Stack, Typography } from '@mui/material';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import EventButton from 'components/event/EventButton';
import EventInput from 'components/event/EventInput';

// ==============================|| SEARCH WIDGET ||============================== //

export default function SearchWidget() {
  const intl = useIntl();
  const navigate = useNavigate();
  const [what, setWhat] = useState('');
  const [where, setWhere] = useState('');
  const [when, setWhen] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (what.trim()) params.set('title', what.trim());
    if (where.trim()) params.set('location', where.trim());
    if (when.trim()) params.set('when', when.trim());
    navigate(`/events${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
          <EventInput
            placeholder={intl.formatMessage({ id: 'search.whatPlaceholder', defaultMessage: 'Search events' })}
            value={what}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWhat(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Stack>
        <Stack spacing={0.5} flex={1} width="100%">
          <Typography variant="caption" color="text.secondary">
            {intl.formatMessage({ id: 'search.where', defaultMessage: 'Where' })}
          </Typography>
          <EventInput
            placeholder={intl.formatMessage({ id: 'search.wherePlaceholder', defaultMessage: 'Location' })}
            value={where}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWhere(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Stack>
        <Stack spacing={0.5} flex={1} width="100%">
          <Typography variant="caption" color="text.secondary">
            {intl.formatMessage({ id: 'search.when', defaultMessage: 'When' })}
          </Typography>
          <EventInput
            type="date"
            placeholder={intl.formatMessage({ id: 'search.whenPlaceholder', defaultMessage: 'Date' })}
            value={when}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWhen(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Stack>
        <EventButton variant="contained" color="primary" sx={{ minWidth: 140, height: 48 }} onClick={handleSearch}>
          {intl.formatMessage({ id: 'search.button', defaultMessage: 'Search' })}
        </EventButton>
      </Stack>
    </Box>
  );
}
