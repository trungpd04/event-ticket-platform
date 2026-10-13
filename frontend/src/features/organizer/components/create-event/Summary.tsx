import { useState } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { requestPublishEvent } from 'api/events';
import { openSnackbar } from 'api/snackbar';
import EventButton from 'components/event/EventButton';
import { BankAccount, CreateEventPayload, EventSettings, TicketType } from 'types/organizer';

interface SummaryProps {
  event: CreateEventPayload;
  ticketTypes: TicketType[];
  settings: EventSettings;
  bankAccount: BankAccount;
  createdEvent?: any;
}

export default function Summary({ event, ticketTypes, settings, bankAccount, createdEvent }: SummaryProps) {
  const intl = useIntl();
  const [publishState, setPublishState] = useState<'idle' | 'sending' | 'done'>('idle');
  const toDate = (value: string) => (value ? new Date(value).toLocaleString(intl.locale) : '-');

  const handleRequestPublish = async () => {
    if (!createdEvent?.id || publishState !== 'idle') return;
    setPublishState('sending');
    try {
      await requestPublishEvent(createdEvent.id);
      setPublishState('done');
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'createEvent.requestPublishSuccess' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
    } catch (err: any) {
      setPublishState('idle');
      openSnackbar({
        open: true,
        message: err?.data?.message || err?.message || intl.formatMessage({ id: 'createEvent.requestPublishFailed' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="h5" color="primary">
          {intl.formatMessage({ id: 'createEvent.summary.created' })}
        </Typography>
        {createdEvent?.id && (
          <Typography variant="body2" color="text.secondary">
            {intl.formatMessage({ id: 'createEvent.summary.eventId' })}: {createdEvent.id}
          </Typography>
        )}
      </Grid>

      <Grid size={12}>
        <Typography variant="h6">{intl.formatMessage({ id: 'createEvent.summary.eventInfo' })}</Typography>
        <Typography>
          {intl.formatMessage({ id: 'createEvent.summary.title' })}: {event.title}
        </Typography>
        <Typography>
          {intl.formatMessage({ id: 'createEvent.summary.location' })}: {event.location}
        </Typography>
        <Typography>
          {intl.formatMessage({ id: 'createEvent.summary.category' })}: {event.categoryId}
        </Typography>
        <Typography>
          {intl.formatMessage({ id: 'createEvent.summary.province' })}: {event.provinceId}
        </Typography>
      </Grid>

      <Grid size={12}>
        <Typography variant="h6">{intl.formatMessage({ id: 'createEvent.summary.dateAndSale' })}</Typography>
        <Typography>
          {intl.formatMessage({ id: 'createEvent.summary.start' })}: {toDate(event.startTime)}
        </Typography>
        <Typography>
          {intl.formatMessage({ id: 'createEvent.summary.end' })}: {toDate(event.endTime)}
        </Typography>
        <Typography>
          {intl.formatMessage({ id: 'createEvent.summary.saleStart' })}: {toDate(event.ticketSaleStartTime)}
        </Typography>
        <Typography>
          {intl.formatMessage({ id: 'createEvent.summary.saleEnd' })}: {toDate(event.ticketSaleEndTime)}
        </Typography>
      </Grid>

      <Grid size={12}>
        <Typography variant="h6">
          {intl.formatMessage({ id: 'createEvent.summary.ticketTypes' })} ({ticketTypes.length})
        </Typography>
        <Stack spacing={1}>
          {ticketTypes.map((t) => (
            <Typography key={t.id}>
              {intl.formatMessage(
                { id: 'createEvent.summary.ticketFormat' },
                {
                  name: t.name,
                  price: t.price.toLocaleString(intl.locale),
                  quantity: t.totalQuantity,
                  min: t.minPerOrder,
                  max: t.maxPerOrder
                }
              )}
            </Typography>
          ))}
        </Stack>
      </Grid>

      <Grid size={12}>
        <Typography variant="h6">{intl.formatMessage({ id: 'createEvent.summary.settings' })}</Typography>
        <Typography>
          {intl.formatMessage({ id: 'createEvent.summary.refundPolicy' })}: {settings.refundPolicy || '-'}
        </Typography>
        <Typography>
          {intl.formatMessage({ id: 'createEvent.summary.ageRestriction' })}: {settings.ageRestriction || '-'}
        </Typography>
        <Typography>
          {intl.formatMessage({ id: 'createEvent.summary.visibility' })}:{' '}
          {settings.isPublic
            ? intl.formatMessage({ id: 'createEvent.summary.public' })
            : intl.formatMessage({ id: 'createEvent.summary.private' })}
        </Typography>
        <Stack direction="row" spacing={0.5} mt={1}>
          {settings.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Stack>
      </Grid>

      <Grid size={12}>
        <Divider />
      </Grid>

      <Grid size={12}>
        <Typography variant="h6">{intl.formatMessage({ id: 'createEvent.summary.payout' })}</Typography>
        <Typography>
          {intl.formatMessage({ id: 'createEvent.summary.bank' })}: {bankAccount.bankName}
        </Typography>
        <Typography>
          {intl.formatMessage({ id: 'createEvent.summary.accountNumber' })}: {bankAccount.accountNumber}
        </Typography>
        <Typography>
          {intl.formatMessage({ id: 'createEvent.summary.holder' })}: {bankAccount.accountHolder}
        </Typography>
        <Typography>
          {intl.formatMessage({ id: 'createEvent.summary.branch' })}: {bankAccount.branch}
        </Typography>
      </Grid>

      {createdEvent?.id && (
        <>
          <Grid size={12}>
            <Divider />
          </Grid>
          <Grid size={12}>
            {publishState === 'done' ? (
              <Typography variant="h6" color="success.main">
                {intl.formatMessage({ id: 'createEvent.requestPublishSuccess' })}
              </Typography>
            ) : (
              <EventButton variant="contained" color="primary" disabled={publishState === 'sending'} onClick={handleRequestPublish}>
                {intl.formatMessage({ id: 'createEvent.requestPublish' })}
              </EventButton>
            )}
          </Grid>
        </>
      )}
    </Grid>
  );
}
