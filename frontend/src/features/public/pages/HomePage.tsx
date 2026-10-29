// material-ui
import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { ArrowRight2 } from 'iconsax-reactjs';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { getCategories, getPublicTicketTypes, searchEvents } from 'api/events';
import EventCard from 'components/event/EventCard';
import EventCardSkeleton from 'components/event/EventCardSkeleton';
import SearchWidget from 'components/event/SearchWidget';
import { Category, Event } from 'types/organizer';
import heroImage from 'assets/images/home/hero.jpeg';

type PublicTicketType = {
  price?: number;
};

// ==============================|| HOME PAGE ||============================== //

export default function HomePage() {
  const intl = useIntl();
  const [categories, setCategories] = useState<Category[]>([]);
  const [eventsByCategory, setEventsByCategory] = useState<Record<number, Event[]>>({});
  const [pricesByEvent, setPricesByEvent] = useState<Record<number, number | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(async (items) => {
        setCategories(items);
        const featured = items.slice(0, 4);
        const results = await Promise.all(
          featured.map(async (category) => {
            try {
              const response = await searchEvents({
                categoryId: category.id,
                status: 'PUBLISHED',
                timeFilter: 'UPCOMING',
                page: 0,
                size: 4
              });
              return [category.id, response.content] as const;
            } catch {
              return [category.id, []] as const;
            }
          })
        );
        setEventsByCategory(Object.fromEntries(results));

        const events = results.flatMap(([, categoryEvents]) => categoryEvents);
        const prices = await Promise.all(
          events.map(async (event) => {
            try {
              const ticketTypes = (await getPublicTicketTypes(event.id)) as PublicTicketType[];
              const availablePrices = ticketTypes.map((ticket) => Number(ticket.price)).filter((price) => Number.isFinite(price));
              return [event.id, availablePrices.length ? Math.min(...availablePrices) : null] as const;
            } catch {
              return [event.id, null] as const;
            }
          })
        );
        setPricesByEvent(Object.fromEntries(prices));
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 720, md: 840 },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundImage: `linear-gradient(180deg, rgba(13, 10, 18, 0.28) 0%, rgba(13, 10, 18, 0.86) 100%), url(${heroImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <Box sx={{ position: 'absolute', width: 382, height: 382, borderRadius: '50%', bgcolor: 'primary.main', opacity: 0.22, filter: 'blur(80px)', top: -165, left: '37%' }} />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: { xs: 8, sm: 9, md: 10 } }}>
          <Stack alignItems="center" textAlign="center" spacing={3}>
            <Typography variant="h1" color="common.white" sx={{ maxWidth: 760, fontSize: { xs: '3rem', md: '4.5rem' }, lineHeight: 1.08, fontWeight: 800, letterSpacing: '-0.06em' }}>
              {intl.formatMessage({ id: 'home.hero.title', defaultMessage: 'What event would you like to go to?' })}
            </Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.72)" maxWidth={620}>
              {intl.formatMessage({
                id: 'home.hero.subtitle',
                defaultMessage: 'More than 100 events in different cities are now available to you.'
              })}
            </Typography>
            <Box sx={{ width: '100%', maxWidth: 1016, mt: 6 }}>
              <SearchWidget />
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 7, md: 10 } }}>
        <Stack spacing={{ xs: 8, md: 12 }}>
          {loading
            ? Array.from({ length: 4 }, (_, sectionIndex) => (
                <Box key={`home-skeleton-section-${sectionIndex}`}>
                  <Stack direction="row" justifyContent="space-between" alignItems="end" mb={3}>
                    <Box sx={{ width: { xs: '65%', sm: 320 } }}>
                      <Box sx={{ width: 180, height: 36, bgcolor: 'rgba(255,255,255,.08)', borderRadius: 1 }} />
                      <Box sx={{ width: 280, maxWidth: '100%', height: 18, mt: 1, bgcolor: 'rgba(255,255,255,.05)', borderRadius: 1 }} />
                    </Box>
                    <Box sx={{ width: 80, height: 24, bgcolor: 'rgba(213,128,242,.12)', borderRadius: 1 }} />
                  </Stack>
                  <Grid container spacing={3}>
                    {Array.from({ length: 4 }, (_, cardIndex) => (
                      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`home-card-skeleton-${sectionIndex}-${cardIndex}`}>
                        <EventCardSkeleton />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))
            : categories.slice(0, 4).map((category) => (
            <Box key={category.id}>
              <Stack direction="row" justifyContent="space-between" alignItems="end" mb={3}>
                <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
                        {category.name}
                      </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    {intl.formatMessage(
                      { id: 'home.category.description', defaultMessage: 'Discover the best {category} events.' },
                      { category: category.name.toLowerCase() }
                    )}
                  </Typography>
                </Box>
                <ButtonBase sx={{ color: 'primary.main', fontWeight: 700, gap: 0.75, pb: 0.5 }}>
                  {intl.formatMessage({ id: 'home.viewAll', defaultMessage: 'View all' })} <ArrowRight2 size={18} />
                </ButtonBase>
              </Stack>
              <Grid container spacing={3}>
                {(eventsByCategory[category.id] || []).map((event) => (
                      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={event.id}>
                    <EventCard event={event} price={pricesByEvent[event.id]} />
                  </Grid>
                ))}
                  </Grid>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
