import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, isValid, parseISO } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';
import { DateRange as DateRangePicker, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

// material-ui
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ArrowDown2, Location, SearchNormal1 } from 'iconsax-reactjs';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { getProvinces, getPublicTicketTypes, searchEvents } from 'api/events';
import EventCard from 'components/event/EventCard';
import EventCardSkeleton from 'components/event/EventCardSkeleton';
import { Event, Province } from 'types/organizer';
import heroImage from 'assets/images/home/hero.jpeg';

const CATEGORY_LABELS = {
  1: { en: 'Sports', vi: 'Thể thao' },
  2: { en: 'Music', vi: 'Ca nhạc' },
  3: { en: 'Theater', vi: 'Kịch' },
  5: { en: 'Exhibitions', vi: 'Triển lãm' }
} as const;

const FAQ_ITEMS = [1, 2, 3, 4, 5, 6];

function getCategoryLabel(categoryId: number | undefined, locale: string) {
  if (!categoryId || !(categoryId in CATEGORY_LABELS)) return undefined;
  const labels = CATEGORY_LABELS[categoryId as keyof typeof CATEGORY_LABELS];
  return locale.startsWith('vi') ? labels.vi : labels.en;
}

function getPriceLabel(price: string, intl: ReturnType<typeof useIntl>) {
  if (price === 'low') return intl.formatMessage({ id: 'events.price.low', defaultMessage: 'Under 500,000 VND' });
  if (price === 'mid') return intl.formatMessage({ id: 'events.price.mid', defaultMessage: '500,000 - 1,000,000 VND' });
  if (price === 'high') return intl.formatMessage({ id: 'events.price.high', defaultMessage: 'Over 1,000,000 VND' });
  return undefined;
}

// ==============================|| EVENTS PAGE ||============================== //

export default function EventsPage() {
  const intl = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricesByEvent, setPricesByEvent] = useState<Record<number, number | null>>({});
  const [provinces, setProvinces] = useState<Province[]>([]);

  const title = searchParams.get('title') || '';
  const provinceIdParam = searchParams.get('provinceId');
  const parsedProvinceId = provinceIdParam ? Number(provinceIdParam) : undefined;
  const provinceId = parsedProvinceId && Number.isInteger(parsedProvinceId) ? parsedProvinceId : undefined;
  const fromDate = searchParams.get('fromDate') || searchParams.get('when') || '';
  const toDate = searchParams.get('toDate') || '';
  const price = searchParams.get('price') || '';
  const categoryIdParam = searchParams.get('categoryId');
  const parsedCategoryId = categoryIdParam ? Number(categoryIdParam) : undefined;
  const categoryId = parsedCategoryId && Number.isInteger(parsedCategoryId) ? parsedCategoryId : undefined;
  const categoryLabel = getCategoryLabel(categoryId, intl.locale);
  const provinceLabel = provinces.find((province) => province.id === provinceId)?.name;
  const priceLabel = getPriceLabel(price, intl);

  const [searchTitle, setSearchTitle] = useState(title);
  const [searchProvinceId, setSearchProvinceId] = useState(provinceId ? String(provinceId) : '');
  const [searchFromDate, setSearchFromDate] = useState(fromDate);
  const [searchToDate, setSearchToDate] = useState(toDate);
  const [searchPrice, setSearchPrice] = useState(price);
  const [datePickerAnchorEl, setDatePickerAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    getProvinces()
      .then((items) => {
        if (!cancelled) setProvinces(items);
      })
      .catch(() => {
        if (!cancelled) setProvinces([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSearchTitle(title);
    setSearchProvinceId(provinceId ? String(provinceId) : '');
    setSearchFromDate(fromDate);
    setSearchToDate(toDate);
    setSearchPrice(price);
  }, [title, provinceId, fromDate, toDate, price]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    searchEvents({
      title: title || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      categoryId,
      provinceId,
      status: 'PUBLISHED',
      page: 0,
      size: 20
    })
      .then(async (data) => {
        if (cancelled) return;
        setEvents(data.content);

        const prices = await Promise.all(
          data.content.map(async (event) => {
            try {
              const ticketTypes = (await getPublicTicketTypes(event.id)) as Array<{ price?: number }>;
              const availablePrices = ticketTypes.map((ticket) => Number(ticket.price)).filter((value) => Number.isFinite(value));
              return [event.id, availablePrices.length ? Math.min(...availablePrices) : null] as const;
            } catch {
              return [event.id, null] as const;
            }
          })
        );
        if (!cancelled) setPricesByEvent(Object.fromEntries(prices));
      })
      .catch(() => {
        if (!cancelled) {
          setEvents([]);
          setPricesByEvent({});
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [title, provinceId, fromDate, toDate, categoryId]);

  const activeFilters = useMemo(
    () =>
      [
        title && { label: title, key: 'title' },
        (fromDate || toDate) && {
          label: fromDate && toDate ? `${fromDate} - ${toDate}` : fromDate || toDate,
          key: 'dateRange'
        },
        provinceLabel && { label: provinceLabel, key: 'provinceId' },
        categoryLabel && { label: categoryLabel, key: 'categoryId' },
        priceLabel && { label: priceLabel, key: 'price' }
      ].filter(Boolean) as Array<{ label: string; key: string }>,
    [title, fromDate, toDate, provinceLabel, categoryLabel, priceLabel]
  );

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const nextParams = new URLSearchParams(searchParams);

    const values = [
      ['title', searchTitle],
      ['price', searchPrice]
    ];

    values.forEach(([key, value]) => {
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    });
    if (searchFromDate) nextParams.set('fromDate', searchFromDate);
    else nextParams.delete('fromDate');
    if (searchToDate) nextParams.set('toDate', searchToDate);
    else nextParams.delete('toDate');
    nextParams.delete('when');
    if (searchProvinceId) nextParams.set('provinceId', searchProvinceId);
    else nextParams.delete('provinceId');
    setSearchParams(nextParams);
  };

  const clearFilter = (key: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (key === 'dateRange') {
      nextParams.delete('fromDate');
      nextParams.delete('toDate');
      nextParams.delete('when');
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  const handleProvinceChange = (value: string) => {
    setSearchProvinceId(value);

    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set('provinceId', value);
    else nextParams.delete('provinceId');
    setSearchParams(nextParams);
  };

  const handleDateRangeChange = (ranges: RangeKeyDict) => {
    const selection = ranges.selection;
    const nextFromDate = selection.startDate && isValid(selection.startDate) ? format(selection.startDate, 'yyyy-MM-dd') : '';
    const nextToDate = selection.endDate && isValid(selection.endDate) ? format(selection.endDate, 'yyyy-MM-dd') : '';
    const nextParams = new URLSearchParams(searchParams);

    if (nextFromDate) nextParams.set('fromDate', nextFromDate);
    else nextParams.delete('fromDate');
    if (nextToDate) nextParams.set('toDate', nextToDate);
    else nextParams.delete('toDate');
    nextParams.delete('when');

    setSearchFromDate(nextFromDate);
    setSearchToDate(nextToDate);
    setSearchParams(nextParams);
  };

  const selectedDateRange = {
    startDate: searchFromDate && isValid(parseISO(searchFromDate)) ? parseISO(searchFromDate) : new Date(),
    endDate:
      searchToDate && isValid(parseISO(searchToDate))
        ? parseISO(searchToDate)
        : searchFromDate && isValid(parseISO(searchFromDate))
          ? parseISO(searchFromDate)
          : new Date(),
    key: 'selection'
  };

  const dateRangeLabel =
    searchFromDate && searchToDate
      ? `${format(parseISO(searchFromDate), 'dd/MM/yyyy')} - ${format(parseISO(searchToDate), 'dd/MM/yyyy')}`
      : '';
  const dateFieldHasValue = Boolean(searchFromDate || searchToDate);
  const dateFieldLabelFloating = dateFieldHasValue || Boolean(datePickerAnchorEl);
  const showInitialSkeletons = loading && events.length === 0;

  return (
    <Box sx={{ bgcolor: '#0b0b0c', color: 'common.white', minHeight: '100%' }}>
      <Container maxWidth="xl" sx={{ pt: { xs: 12, md: 19 }, pb: { xs: 8, md: 18 } }}>
        <Box component="form" onSubmit={handleSearch}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                value={searchTitle}
                onChange={(event) => setSearchTitle(event.target.value)}
                placeholder={intl.formatMessage({ id: 'events.search', defaultMessage: 'What are you looking for?' })}
                sx={{ flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchNormal1 size={18} />
                    </InputAdornment>
                  )
                }}
              />
              <Box sx={{ flex: 2, minWidth: 280 }}>
                <Box sx={{ position: 'relative' }}>
                  <Typography
                    component="span"
                    sx={{
                      position: 'absolute',
                      zIndex: 1,
                      top: dateFieldLabelFloating ? 0 : '50%',
                      left: dateFieldLabelFloating ? 12 : 16,
                      transform: 'translateY(-50%)',
                      px: dateFieldLabelFloating ? 0.5 : 0,
                      bgcolor: '#0b0b0c',
                      color: datePickerAnchorEl ? '#c14fe6' : 'rgba(255,255,255,.38)',
                      fontFamily: '"Inter var", "Inter", sans-serif',
                      fontSize: dateFieldLabelFloating ? 12 : 14,
                      fontWeight: 400,
                      lineHeight: 1,
                      pointerEvents: 'none',
                      transition: 'all .2s ease'
                    }}
                  >
                    {intl.formatMessage({ id: 'events.when', defaultMessage: 'When' })}
                  </Typography>
                  <ButtonBase
                    onClick={(event) => setDatePickerAnchorEl(event.currentTarget)}
                    sx={{
                      width: '100%',
                      height: 48,
                      justifyContent: 'flex-start',
                      px: 2,
                      pt: dateFieldLabelFloating ? 1 : 0,
                      border: '1px solid',
                      borderColor: datePickerAnchorEl ? '#c14fe6' : 'rgba(255,255,255,.12)',
                      borderRadius: 1,
                      color: dateFieldHasValue ? 'rgba(255,255,255,.72)' : 'rgba(255,255,255,.38)',
                      textAlign: 'left',
                      fontFamily: '"Inter var", "Inter", sans-serif',
                      fontSize: 14,
                      fontWeight: 400,
                      letterSpacing: 'normal',
                      lineHeight: 1.4,
                      '&:hover': { borderColor: 'rgba(255,255,255,.24)' }
                    }}
                  >
                    {dateRangeLabel}
                  </ButtonBase>
                </Box>
                <Popover
                  open={Boolean(datePickerAnchorEl)}
                  anchorEl={datePickerAnchorEl}
                  disableScrollLock
                  onClose={() => setDatePickerAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1,
                        overflow: 'hidden',
                        fontFamily: '"Inter var", "Inter", sans-serif',
                        '& .rdrCalendarWrapper, & .rdrDateDisplayWrapper, & .rdrMonthAndYearWrapper, & .rdrWeekDay, & .rdrDayNumber, & .rdrMonthName, & .rdrYearPicker, & .rdrMonthPicker':
                          { fontFamily: '"Inter var", "Inter", sans-serif' }
                      }
                    }
                  }}
                >
                  <DateRangePicker
                    ranges={[selectedDateRange]}
                    onChange={handleDateRangeChange}
                    locale={intl.locale.startsWith('vi') ? vi : enUS}
                    moveRangeOnFirstSelection={false}
                    editableDateInputs
                    rangeColors={['#c14fe6']}
                    months={1}
                    direction="horizontal"
                  />
                </Popover>
              </Box>
              <TextField
                select
                value={searchProvinceId}
                onChange={(event) => handleProvinceChange(event.target.value)}
                label={intl.formatMessage({ id: 'events.where', defaultMessage: 'Where' })}
                sx={{ flex: 1 }}
                SelectProps={{ IconComponent: ArrowDown2, MenuProps: { disableScrollLock: true } }}
              >
                <MenuItem value="">{intl.formatMessage({ id: 'events.anyProvince', defaultMessage: 'All locations' })}</MenuItem>
                {provinces.map((province) => (
                  <MenuItem key={province.id} value={province.id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Location size={16} />
                      <span>{province.name}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                value={searchPrice}
                onChange={(event) => setSearchPrice(event.target.value)}
                label={intl.formatMessage({ id: 'events.price', defaultMessage: 'Price' })}
                sx={{ flex: 1 }}
                SelectProps={{ IconComponent: ArrowDown2, MenuProps: { disableScrollLock: true } }}
              >
                <MenuItem value="">{intl.formatMessage({ id: 'events.anyPrice', defaultMessage: 'Any price' })}</MenuItem>
                <MenuItem value="low">{intl.formatMessage({ id: 'events.price.low', defaultMessage: 'Under 500,000 VND' })}</MenuItem>
                <MenuItem value="mid">{intl.formatMessage({ id: 'events.price.mid', defaultMessage: '500,000 - 1,000,000 VND' })}</MenuItem>
                <MenuItem value="high">{intl.formatMessage({ id: 'events.price.high', defaultMessage: 'Over 1,000,000 VND' })}</MenuItem>
              </TextField>
            </Stack>

            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              flexWrap="nowrap"
              useFlexGap
              sx={{ overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { height: 4 } }}
            >
              <Typography color="rgba(255,255,255,.82)" sx={{ mr: 1 }}>
                {intl.formatMessage({ id: 'events.yourSearch', defaultMessage: 'Your search:' })}
              </Typography>
              {activeFilters.map((filter) => (
                <Chip
                  key={filter.key}
                  label={filter.label}
                  onDelete={() => clearFilter(filter.key)}
                  sx={{ color: 'white', bgcolor: '#252329', border: '1px solid #3b3540' }}
                />
              ))}
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ mt: 6 }}>
          {showInitialSkeletons ? (
            <Grid container columnSpacing={3} rowSpacing={{ xs: 3, md: 7.25 }}>
              {Array.from({ length: 8 }, (_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`event-skeleton-${index}`}>
                  <EventCardSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : events.length === 0 ? (
            <Typography color="rgba(255,255,255,.6)">
              {intl.formatMessage({ id: 'events.empty', defaultMessage: 'No events found.' })}
            </Typography>
          ) : (
            <Grid container columnSpacing={3} rowSpacing={{ xs: 3, md: 7.25 }}>
              {events.map((event) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={event.id}>
                  <EventCard event={event} price={pricesByEvent[event.id]} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {!loading && events.length > 0 && (
          <Stack alignItems="center" sx={{ mt: 7 }}>
            <Button
              variant="contained"
              sx={{
                minWidth: 184,
                height: 48,
                borderRadius: 1,
                bgcolor: '#d580f2',
                color: '#17131b',
                '&:hover': { bgcolor: '#c14fe6' }
              }}
            >
              {intl.formatMessage({ id: 'events.viewMore', defaultMessage: 'View more events' })}
            </Button>
          </Stack>
        )}
      </Container>

      <Box
        sx={{
          minHeight: 263,
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(90deg, rgba(37, 12, 51, .96), rgba(88, 26, 112, .65)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          px: { xs: 3, md: 13.5 },
          py: 6
        }}
      >
        <Stack spacing={1.5} maxWidth={545}>
          <Typography variant="h3" fontWeight={800} color="white">
            {intl.formatMessage({ id: 'events.cta.title', defaultMessage: 'Start exploring event today!' })}
          </Typography>
          <Typography color="rgba(255,255,255,.72)">
            {intl.formatMessage({ id: 'events.cta.description', defaultMessage: 'Find concerts, shows, and more near you.' })}
          </Typography>
          <Button variant="contained" sx={{ alignSelf: 'flex-start', mt: 1, bgcolor: '#d580f2', color: '#17131b' }}>
            {intl.formatMessage({ id: 'events.cta.button', defaultMessage: 'Start' })}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ bgcolor: '#0f0f10', py: { xs: 8, md: 14 } }}>
        <Container maxWidth="md">
          <Stack alignItems="center" textAlign="center" spacing={1}>
            <Typography variant="h4" fontWeight={800} color="white">
              {intl.formatMessage({ id: 'events.faq.title', defaultMessage: 'Frequently Asked Questions' })}
            </Typography>
            <Typography color="rgba(255,255,255,.56)" maxWidth={584}>
              {intl.formatMessage({
                id: 'events.faq.description',
                defaultMessage: 'Explore the most common questions and detailed answers about our events, concerts, and security.'
              })}
            </Typography>
          </Stack>
          <Stack spacing={2} sx={{ mt: 7 }}>
            {FAQ_ITEMS.map((item) => (
              <Accordion
                key={item}
                disableGutters
                sx={{
                  bgcolor: '#19191a',
                  color: 'white',
                  border: '1px solid #2b2b2d',
                  borderRadius: '6px !important',
                  '&:before': { display: 'none' }
                }}
              >
                <AccordionSummary expandIcon={<ArrowDown2 size={18} color="#fff" />}>
                  <Typography variant="body2">
                    {intl.formatMessage({
                      id: `home.faq.${item}.question`,
                      defaultMessage: 'How can I get more information about this event?'
                    })}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="rgba(255,255,255,.62)">
                    {intl.formatMessage({
                      id: `home.faq.${item}.answer`,
                      defaultMessage: 'Please review the event details or contact the organizer for more information.'
                    })}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
