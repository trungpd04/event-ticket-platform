import { useEffect, useMemo, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';

// project-imports
import { createEventUpdateRequest, getOrganizerEventDetail, updateEvent } from 'api/events';
import { openSnackbar } from 'api/snackbar';
import EventButton from 'components/event/EventButton';
import EventWizard from 'features/organizer/components/create-event/EventWizard';
import PublishedEventUpdateForm from 'features/organizer/components/create-event/PublishedEventUpdateForm';
import { getApiErrorMessage } from 'features/organizer/components/create-event/EventWizard';
import { mapDetailToFormValues } from 'features/organizer/utils/eventForm';

// types
import { CreateEventPayload, EventDetail, PublishedEventUpdatePayload } from 'types/organizer';

// ==============================|| ORGANIZER - EDIT EVENT PAGE ||============================== //

export default function EditEventPage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const id = Number(eventId);

  const [detail, setDetail] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError(intl.formatMessage({ id: 'editEvent.notFound' }));
      return;
    }

    let cancelled = false;
    setLoading(true);
    getOrganizerEventDetail(id)
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError(intl.formatMessage({ id: 'editEvent.loadError' }));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, intl]);

  const initialValues = useMemo<CreateEventPayload | null>(() => (detail ? mapDetailToFormValues(detail) : null), [detail]);
  const status = String(detail?.status ?? '');
  const isPublished = status === 'PUBLISHED' || status === 'ONGOING';
  const isEditablePending = status === 'PENDING' || status === 'PENDING_REVIEW';

  const handlePublishedSubmit = async (payload: PublishedEventUpdatePayload) => {
    try {
      await createEventUpdateRequest(id, payload);
      setRequestSubmitted(true);
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'editEvent.requestSuccess' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: getApiErrorMessage(err, intl.formatMessage({ id: 'editEvent.requestFailed' })),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Stack alignItems="center" spacing={2} py={10}>
          <CircularProgress />
          <Typography color="text.secondary">{intl.formatMessage({ id: 'editEvent.loading' })}</Typography>
        </Stack>
      </Container>
    );
  }

  if (error || !initialValues || !detail) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || intl.formatMessage({ id: 'editEvent.loadError' })}
        </Alert>
        <EventButton variant="outlined" color="secondary" onClick={() => navigate('/organizer/events')}>
          {intl.formatMessage({ id: 'editEvent.backToEvents' })}
        </EventButton>
      </Container>
    );
  }

  if (!isPublished && !isEditablePending) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          {intl.formatMessage({ id: 'editEvent.notEditable' }, { status })}
        </Alert>
        <EventButton variant="outlined" color="secondary" onClick={() => navigate('/organizer/events')}>
          {intl.formatMessage({ id: 'editEvent.backToEvents' })}
        </EventButton>
      </Container>
    );
  }

  if (isPublished) {
    if (requestSubmitted) {
      return (
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            {intl.formatMessage({ id: 'editEvent.requestSuccess' })}
          </Alert>
          <EventButton variant="outlined" color="secondary" onClick={() => navigate('/organizer/events')}>
            {intl.formatMessage({ id: 'editEvent.backToEvents' })}
          </EventButton>
        </Container>
      );
    }

    return <PublishedEventUpdateForm detail={detail} onSubmit={handlePublishedSubmit} />;
  }

  return (
    <EventWizard
      mode="edit"
      initialValues={initialValues}
      titleId="editEvent.title"
      subtitleId="editEvent.subtitle"
      submitLabelId="editEvent.submit"
      successMessageId="editEvent.success"
      errorMessageId="editEvent.failed"
      successHeadingId="editEvent.updated"
      onSubmit={(payload) => updateEvent(id, payload)}
    />
  );
}
