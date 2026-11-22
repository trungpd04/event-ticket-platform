import { useEffect, useState } from 'react';

// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import EventButton from 'components/event/EventButton';
import ImageUploadField from 'components/event/ImageUploadField';
import { getCategories } from 'api/events';
import { initialBankAccount, initialSettings } from 'features/organizer/utils/eventForm';

// types
import { BankAccount, Category, EventDetail, EventSettings, PublishedEventUpdatePayload } from 'types/organizer';

interface PublishedEventUpdateFormProps {
  detail: EventDetail;
  onSubmit: (payload: PublishedEventUpdatePayload) => Promise<unknown>;
  submitting?: boolean;
}

export default function PublishedEventUpdateForm({ detail, onSubmit, submitting = false }: PublishedEventUpdateFormProps) {
  const intl = useIntl();
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState(detail.description ?? '');
  const [categoryId, setCategoryId] = useState<number | ''>(detail.category?.id ?? '');
  const [thumbnailFileId, setThumbnailFileId] = useState<number | ''>(detail.thumbnailFileId ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(detail.thumbnailUrl ?? '');
  const [bannerFileId, setBannerFileId] = useState<number | ''>(detail.bannerFileId ?? '');
  const [bannerUrl, setBannerUrl] = useState(detail.bannerUrl ?? '');
  const [settings, setSettings] = useState<EventSettings>(detail.settings ?? initialSettings);
  const [payoutInfo, setPayoutInfo] = useState<BankAccount>(detail.payoutInfo ?? initialBankAccount);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const tagString = settings.tags.join(', ');

  const handleSubmit = async () => {
    await onSubmit({
      description,
      thumbnailFileId,
      bannerFileId,
      categoryId,
      settings,
      payoutInfo
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <Typography variant="h2" mb={1} sx={{ fontWeight: 800, letterSpacing: '-0.06em' }}>
        {intl.formatMessage({ id: 'editEvent.title' })}
      </Typography>
      <Typography color="text.secondary" mb={4}>
        {intl.formatMessage({ id: 'editEvent.publishedSubtitle' })}
      </Typography>

      <Grid container spacing={4} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2.5, position: { md: 'sticky' }, top: 96 }}>
            <Typography variant="overline" color="text.secondary" fontWeight={700}>
              {intl.formatMessage({ id: 'editEvent.publishedNoticeTitle' })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {intl.formatMessage({ id: 'editEvent.publishedNotice' })}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography variant="h6" fontWeight={700}>
                  {intl.formatMessage({ id: 'createEvent.eventInfoTitle' })}
                </Typography>
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={intl.formatMessage({ id: 'createEvent.description' })}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>

              <Grid size={12}>
                <Autocomplete
                  options={categories}
                  getOptionLabel={(opt) => opt.name}
                  value={categories.find((c) => c.id === Number(categoryId)) || null}
                  onChange={(_, value) => setCategoryId(value ? value.id : '')}
                  renderInput={(params) => (
                    <TextField {...params} label={intl.formatMessage({ id: 'createEvent.category' })} />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ImageUploadField
                  label={intl.formatMessage({ id: 'createEvent.thumbnailImage' })}
                  hint={intl.formatMessage({ id: 'createEvent.thumbnailHintLong' })}
                  fileType={1}
                  value={thumbnailFileId}
                  previewUrl={thumbnailUrl}
                  onChange={(id, url) => {
                    setThumbnailFileId(id);
                    setThumbnailUrl(url || '');
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ImageUploadField
                  label={intl.formatMessage({ id: 'createEvent.bannerImage' })}
                  hint={intl.formatMessage({ id: 'createEvent.bannerHintLong' })}
                  fileType={2}
                  value={bannerFileId}
                  previewUrl={bannerUrl}
                  onChange={(id, url) => {
                    setBannerFileId(id);
                    setBannerUrl(url || '');
                  }}
                />
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={12}>
                <Typography variant="h6" fontWeight={700}>
                  {intl.formatMessage({ id: 'createEvent.steps.settings' })}
                </Typography>
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={intl.formatMessage({ id: 'createEvent.refundPolicy' })}
                  value={settings.refundPolicy}
                  onChange={(e) => setSettings({ ...settings, refundPolicy: e.target.value })}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label={intl.formatMessage({ id: 'createEvent.ageRestriction' })}
                  value={settings.ageRestriction}
                  onChange={(e) => setSettings({ ...settings, ageRestriction: e.target.value })}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label={intl.formatMessage({ id: 'createEvent.tags' })}
                  value={tagString}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tags: e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
                    })
                  }
                />
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.isPublic}
                      onChange={(e) => setSettings({ ...settings, isPublic: e.target.checked })}
                    />
                  }
                  label={intl.formatMessage({ id: 'createEvent.publicEvent' })}
                />
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={12}>
                <Typography variant="h6" fontWeight={700}>
                  {intl.formatMessage({ id: 'createEvent.steps.payout' })}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={intl.formatMessage({ id: 'createEvent.bankName' })}
                  value={payoutInfo.bankName}
                  onChange={(e) => setPayoutInfo({ ...payoutInfo, bankName: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={intl.formatMessage({ id: 'createEvent.accountNumber' })}
                  value={payoutInfo.accountNumber}
                  onChange={(e) => setPayoutInfo({ ...payoutInfo, accountNumber: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={intl.formatMessage({ id: 'createEvent.accountHolder' })}
                  value={payoutInfo.accountHolder}
                  onChange={(e) => setPayoutInfo({ ...payoutInfo, accountHolder: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={intl.formatMessage({ id: 'createEvent.branch' })}
                  value={payoutInfo.branch}
                  onChange={(e) => setPayoutInfo({ ...payoutInfo, branch: e.target.value })}
                />
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" mt={4}>
              <EventButton variant="contained" color="primary" disabled={submitting} onClick={handleSubmit}>
                {intl.formatMessage({ id: 'editEvent.submitRequest' })}
              </EventButton>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
