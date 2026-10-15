import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Divider, Stack, Typography } from '@mui/material';
import { Calendar1, Category2, Location, SearchNormal1 } from 'iconsax-reactjs';
import { useIntl } from 'react-intl';

import EventButton from 'components/event/EventButton';
import EventInput from 'components/event/EventInput';

const TABS = [
  { id: 'all', message: 'search.tab.all' },
  { id: 'concerts', message: 'header.concerts' },
  { id: 'shows', message: 'header.shows' },
  { id: 'sports', message: 'header.sports' },
  { id: 'festivals', message: 'header.festivals' }
];

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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleSearch();
  };

  const inputSx = { border: 0, p: 0, '& fieldset': { border: 0 } };

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: { xs: 2, md: 3 }, boxShadow: '0 20px 60px rgba(0,0,0,.22)' }}>
      <Stack direction="row" spacing={{ xs: 2, md: 5 }} sx={{ px: { xs: 0, md: 2 }, mb: 2, overflowX: 'auto' }}>
        {TABS.map((tab, index) => (
          <Typography
            key={tab.id}
            variant="body2"
            sx={{
              whiteSpace: 'nowrap',
              pb: 1.5,
              fontWeight: 700,
              color: index === 0 ? 'primary.main' : 'text.secondary',
              borderBottom: 2,
              borderColor: index === 0 ? 'primary.main' : 'transparent'
            }}
          >
            {intl.formatMessage({
              id: tab.message,
              defaultMessage: tab.id === 'all' ? 'All events' : tab.id
            })}
          </Typography>
        ))}
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 1 }} alignItems="center">
        <Stack spacing={0.5} flex={1} width="100%">
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Category2 size={22} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {intl.formatMessage({ id: 'search.what', defaultMessage: 'What' })}
              </Typography>
              <EventInput
                placeholder={intl.formatMessage({ id: 'search.whatPlaceholder', defaultMessage: 'Event type' })}
                value={what}
                onChange={(event) => setWhat(event.target.value)}
                onKeyDown={handleKeyDown}
                sx={inputSx}
              />
            </Box>
          </Stack>
        </Stack>
        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
        <Stack spacing={0.5} flex={1} width="100%">
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Location size={22} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {intl.formatMessage({ id: 'search.where', defaultMessage: 'Where' })}
              </Typography>
              <EventInput
                placeholder={intl.formatMessage({ id: 'search.wherePlaceholder', defaultMessage: 'Location' })}
                value={where}
                onChange={(event) => setWhere(event.target.value)}
                onKeyDown={handleKeyDown}
                sx={inputSx}
              />
            </Box>
          </Stack>
        </Stack>
        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
        <Stack spacing={0.5} flex={1} width="100%">
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Calendar1 size={22} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {intl.formatMessage({ id: 'search.when', defaultMessage: 'When' })}
              </Typography>
              <EventInput type="date" value={when} onChange={(event) => setWhen(event.target.value)} onKeyDown={handleKeyDown} sx={inputSx} />
            </Box>
          </Stack>
        </Stack>
        <EventButton variant="contained" color="primary" startIcon={<SearchNormal1 size={18} />} sx={{ minWidth: 120, height: 48 }} onClick={handleSearch}>
          {intl.formatMessage({ id: 'search.button', defaultMessage: 'Search' })}
        </EventButton>
      </Stack>
    </Box>
  );
}
