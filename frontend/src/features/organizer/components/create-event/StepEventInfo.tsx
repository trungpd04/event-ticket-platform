import { useEffect, useState } from 'react';
import { FormikErrors, FormikTouched } from 'formik';

// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { getWards } from 'api/events';
import { Category, CreateEventPayload, Province, Ward } from 'types/organizer';

interface StepEventInfoProps {
  values: CreateEventPayload;
  categories: Category[];
  provinces: Province[];
  touched: FormikTouched<CreateEventPayload>;
  errors: FormikErrors<CreateEventPayload>;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
}

export default function StepEventInfo({
  values,
  categories,
  provinces,
  touched,
  errors,
  handleChange,
  handleBlur,
  setFieldValue
}: StepEventInfoProps) {
  const intl = useIntl();
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    if (!values.provinceId) {
      setWards([]);
      setFieldValue('wardId', '');
      return;
    }
    const province = provinces.find((p) => p.id === Number(values.provinceId));
    if (province?.provinceCode) {
      getWards(province.provinceCode)
        .then((data) => {
          setWards(data);
          const stillValid = data.some((w) => w.id === Number(values.wardId));
          if (!stillValid) {
            setFieldValue('wardId', '');
          }
        })
        .catch(() => {
          setWards([]);
          setFieldValue('wardId', '');
        });
    } else {
      setWards([]);
      setFieldValue('wardId', '');
    }
  }, [values.provinceId, provinces]);

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <TextField
          fullWidth
          name="title"
          label={intl.formatMessage({ id: 'createEvent.eventTitle' })}
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          error={Boolean(touched.title && errors.title)}
          helperText={touched.title && errors.title}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          name="description"
          label={intl.formatMessage({ id: 'createEvent.description' })}
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          name="coverImageUrl"
          label={intl.formatMessage({ id: 'createEvent.coverImageUrl' })}
          value={values.coverImageUrl}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Autocomplete
          options={categories}
          getOptionLabel={(opt) => opt.name}
          value={categories.find((c) => c.id === Number(values.categoryId)) || null}
          onChange={(_, value) => setFieldValue('categoryId', value ? value.id : '')}
          renderInput={(params) => (
            <TextField
              {...params}
              name="categoryId"
              label={intl.formatMessage({ id: 'createEvent.category' })}
              error={Boolean(touched.categoryId && errors.categoryId)}
              helperText={touched.categoryId && errors.categoryId}
            />
          )}
        />
      </Grid>

      {/* Address section */}
      <Grid size={12}>
        <TextField
          fullWidth
          name="location"
          label={intl.formatMessage({ id: 'createEvent.detailedAddress' })}
          value={values.location}
          onChange={handleChange}
          onBlur={handleBlur}
          error={Boolean(touched.location && errors.location)}
          helperText={touched.location && errors.location}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Autocomplete
          options={provinces}
          getOptionLabel={(opt) => opt.name}
          value={provinces.find((p) => p.id === Number(values.provinceId)) || null}
          onChange={(_, value) => {
            setFieldValue('provinceId', value ? value.id : '');
            setFieldValue('wardId', '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              name="provinceId"
              label={intl.formatMessage({ id: 'createEvent.province' })}
              error={Boolean(touched.provinceId && errors.provinceId)}
              helperText={touched.provinceId && errors.provinceId}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Autocomplete
          options={wards}
          getOptionLabel={(opt) => opt.name}
          value={wards.find((w) => w.id === Number(values.wardId)) || null}
          onChange={(_, value) => setFieldValue('wardId', value ? value.id : '')}
          disabled={!values.provinceId || wards.length === 0}
          renderInput={(params) => (
            <TextField
              {...params}
              name="wardId"
              label={
                values.provinceId
                  ? intl.formatMessage({ id: 'createEvent.ward' })
                  : intl.formatMessage({ id: 'createEvent.selectProvinceFirst' })
              }
              error={Boolean(touched.wardId && errors.wardId)}
              helperText={touched.wardId && errors.wardId}
            />
          )}
        />
      </Grid>
    </Grid>
  );
}
