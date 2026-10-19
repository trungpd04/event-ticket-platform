import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Calendar1, Location, Timer1 } from 'iconsax-reactjs';
import { useIntl } from 'react-intl';

import { Event } from 'types/organizer';
import { formatCurrency, formatRemainingTime, formatShortDate, isWithinNextDay } from 'utils/format';

type EventCardProps = {
  event: Event;
  price?: number | null;
};

export default function EventCard({ event, price }: EventCardProps) {
  const intl = useIntl();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formattedDate = formatShortDate(event.startTime, intl.locale);
  const formattedPrice =
    price === null || price === undefined
      ? intl.formatMessage({ id: 'home.card.priceUnavailable', defaultMessage: 'Contact for price' })
      : formatCurrency(price, intl.locale);
  const showRemainingTime = isWithinNextDay(event.ticketSaleEndTime, now);

  return (
    <Box
      component={RouterLink}
      to={`/events/${event.id}`}
      sx={{
        position: 'relative',
        display: 'block',
        width: '100%',
        height: 416,
        borderRadius: 2.5,
        overflow: 'hidden',
        bgcolor: '#1b1b1b',
        '&:hover img': { transform: 'scale(1.04)' },
        textDecoration: 'none'
      }}
    >
      <Box
        component="img"
        src={event.thumbnailUrl || event.bannerUrl}
        alt={event.title}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: 336,
          objectFit: 'cover',
          borderRadius: 2.5,
          display: 'block',
          transition: 'transform .3s'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 1,
          right: 1,
          bottom: 1,
          minHeight: showRemainingTime ? 151 : 103,
          overflow: 'hidden',
          border: '1px solid #303030',
          borderRadius: 2,
          bgcolor: '#1b1b1b',
          boxShadow: '0 -10px 24px rgba(0,0,0,.12)'
        }}
      >
        {showRemainingTime && (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ px: 2, py: 1, bgcolor: '#850d06', color: 'common.white' }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Timer1 size={16} />
              <Typography variant="caption" color="inherit">
                {intl.formatMessage({ id: 'home.card.timeToSaleEnd', defaultMessage: 'Time to ticket sale end' })}
              </Typography>
            </Stack>
            <Typography variant="caption" color="inherit">
              {formatRemainingTime(event.ticketSaleEndTime, now)}
            </Typography>
          </Stack>
        )}
        <Stack spacing={1.5} sx={{ p: 2 }}>
          <Typography
            sx={{
              color: 'common.white',
              fontSize: 20,
              lineHeight: 1,
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {event.title}
          </Typography>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
              <Calendar1 size={16} color="#999999" />
              <Typography variant="body2" color="#999999" noWrap>
                {formattedDate}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0, maxWidth: '45%' }}>
              <Location size={16} color="#999999" />
              <Typography variant="body2" color="#999999" noWrap>
                {event.province?.name}
              </Typography>
            </Stack>
          </Stack>
          <Typography sx={{ color: '#d580f2', fontSize: 18, lineHeight: 1, fontWeight: 700 }}>
            {intl.formatMessage({ id: 'home.card.from', defaultMessage: 'from' })} {formattedPrice}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
