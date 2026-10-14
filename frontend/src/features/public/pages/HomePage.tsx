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
import { getCategories, searchEvents } from 'api/events';
import SearchWidget from 'components/event/SearchWidget';
import { Category, Event } from 'types/organizer';
import heroImage from 'assets/images/home/hero.jpeg';

// ==============================|| HOME PAGE ||============================== //

export default function HomePage() {
  const intl = useIntl();
  const [categories, setCategories] = useState<Category[]>([]);
  const [eventsByCategory, setEventsByCategory] = useState<Record<number, Event[]>>({});

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
      })
      .catch(() => setCategories([]));
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
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack alignItems="center" textAlign="center" spacing={3}>
            <Typography variant="h1" color="common.white" sx={{ maxWidth: 760, fontSize: { xs: '3rem', md: '4.5rem' }, lineHeight: 1.08, fontWeight: 800, letterSpacing: '-0.06em' }}>
              What event would you like to go to?
            </Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.72)" maxWidth={620}>
              More than 100 events in different cities are now available to you.
            </Typography>
            <Box sx={{ width: '100%', maxWidth: 1016, mt: 6 }}>
              <SearchWidget />
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 7, md: 10 } }}>
        <Stack spacing={{ xs: 8, md: 12 }}>
          {categories.slice(0, 4).map((category) => (
            <Box key={category.id}>
              <Stack direction="row" justifyContent="space-between" alignItems="end" mb={3}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>{category.name}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>Discover the best {category.name.toLowerCase()} events.</Typography>
                </Box>
                <ButtonBase sx={{ color: 'primary.main', fontWeight: 700, gap: 0.75, pb: 0.5 }}>
                  View all <ArrowRight2 size={18} />
                </ButtonBase>
              </Stack>
              <Grid container spacing={3}>
                {(eventsByCategory[category.id] || []).map((event) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={event.id}>
                    <Box sx={{ overflow: 'hidden', borderRadius: 2.5, bgcolor: 'background.paper', border: 1, borderColor: 'divider', '&:hover img': { transform: 'scale(1.04)' } }}>
                      <Box component="img" src={event.thumbnailUrl || event.bannerUrl} alt={event.title} sx={{ width: '100%', height: 240, objectFit: 'cover', display: 'block', transition: 'transform .3s' }} />
                      <Box sx={{ p: 2 }}>
                        <Typography variant="h6" noWrap fontWeight={700}>{event.title}</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>{event.location}</Typography>
                        <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ display: 'block', mt: 1 }}>{new Date(event.startTime).toLocaleDateString()}</Typography>
                      </Box>
                    </Box>
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
