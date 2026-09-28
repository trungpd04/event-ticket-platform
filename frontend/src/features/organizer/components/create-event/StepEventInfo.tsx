import { FormikErrors, FormikTouched } from 'formik';

// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

// project-imports
import { Category, CreateEventPayload, Province } from 'types/organizer';

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
  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <TextField
          fullWidth
          name="title"
          label="Event title"
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
          label="Description"
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          name="location"
          label="Location"
          value={values.location}
          onChange={handleChange}
          onBlur={handleBlur}
          error={Boolean(touched.location && errors.location)}
          helperText={touched.location && errors.location}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          name="coverImageUrl"
          label="Cover image URL"
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
              label="Category"
              error={Boolean(touched.categoryId && errors.categoryId)}
              helperText={touched.categoryId && errors.categoryId}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Autocomplete
          options={provinces}
          getOptionLabel={(opt) => opt.name}
          value={provinces.find((p) => p.id === Number(values.provinceId)) || null}
          onChange={(_, value) => setFieldValue('provinceId', value ? value.id : '')}
          renderInput={(params) => (
            <TextField
              {...params}
              name="provinceId"
              label="Province"
              error={Boolean(touched.provinceId && errors.provinceId)}
              helperText={touched.provinceId && errors.provinceId}
            />
          )}
        />
      </Grid>
    </Grid>
  );
}
