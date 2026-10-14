import { useEffect, useMemo, useState } from 'react';

// material-ui
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';

// third-party
import { FormikErrors, FormikTouched } from 'formik';
import { Formik } from 'formik';
import * as Yup from 'yup';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { openSnackbar } from 'api/snackbar';
import { createEvent, getCategories, getProvinces } from 'api/events';
import EventButton from 'components/event/EventButton';
import StepEventInfo from 'features/organizer/components/create-event/StepEventInfo';
import StepPayout from 'features/organizer/components/create-event/StepPayout';
import StepSettings from 'features/organizer/components/create-event/StepSettings';
import StepTickets from 'features/organizer/components/create-event/StepTickets';
import Summary from 'features/organizer/components/create-event/Summary';

// types
import { BankAccount, Category, CreateEventPayload, EventSettings, Province } from 'types/organizer';

const steps = ['createEvent.steps.info', 'createEvent.steps.tickets', 'createEvent.steps.settings', 'createEvent.steps.payout'];

const initialSettings: EventSettings = {
  refundPolicy: '',
  ageRestriction: '',
  tags: [],
  isPublic: true
};

const initialBankAccount: BankAccount = {
  bankName: '',
  accountNumber: '',
  accountHolder: '',
  branch: ''
};

const initialEvent: CreateEventPayload = {
  title: '',
  description: '',
  location: '',
  thumbnailFileId: '',
  bannerFileId: '',
  thumbnailUrl: '',
  bannerUrl: '',
  categoryId: '',
  provinceId: '',
  wardId: '',
  startTime: '',
  endTime: '',
  ticketSaleStartTime: '',
  ticketSaleEndTime: '',
  ticketTypes: [],
  settings: initialSettings,
  payoutInfo: initialBankAccount
};

const ONE_HOUR_MS = 60 * 60 * 1000;

const isAfter = (value?: string, other?: string) => {
  if (!value || !other) return true;
  return new Date(value).getTime() > new Date(other).getTime();
};

const isBeforeOrEqual = (value?: string, other?: string) => {
  if (!value || !other) return true;
  return new Date(value).getTime() <= new Date(other).getTime();
};

const findFirstErrorMessage = (errors: unknown): string | undefined => {
  if (!errors || typeof errors !== 'object') return undefined;
  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (typeof value === 'string' && value.trim()) return value;
    if (value && typeof value === 'object') {
      const nested = findFirstErrorMessage(value);
      if (nested) return nested;
    }
  }
  return undefined;
};

const getApiErrorMessage = (err: any, fallback: string): string => {
  const body = err && typeof err === 'object' && err.data && typeof err.data === 'object' ? err.data : err?.response?.data;
  if (body?.data && typeof body.data === 'object') {
    const detail = findFirstErrorMessage(body.data);
    if (detail) return detail;
  }
  if (typeof body?.message === 'string' && body.message) return body.message;
  if (typeof err?.message === 'string' && err.message) return err.message;
  return fallback;
};

const getValidation = (intl: ReturnType<typeof useIntl>) => {
  const required = (fieldId: string) => intl.formatMessage({ id: 'validation.required' }, { field: intl.formatMessage({ id: fieldId }) });

  return [
    Yup.object({
      title: Yup.string().required(required('createEvent.eventTitle')),
      location: Yup.string().required(required('createEvent.detailedAddress')),
      categoryId: Yup.number().required(required('createEvent.category')),
      provinceId: Yup.number().required(required('createEvent.province')),
      wardId: Yup.number().required(required('createEvent.ward')),
      thumbnailFileId: Yup.number().required(required('createEvent.thumbnailImage')),
      bannerFileId: Yup.number().required(required('createEvent.bannerImage'))
    }),
    Yup.object({
      startTime: Yup.string()
        .required(required('createEvent.eventStartTime'))
        .test(
          'start-time-too-soon',
          intl.formatMessage({ id: 'createEvent.errors.startTimeTooSoon' }),
          (value) => !value || new Date(value).getTime() > Date.now() + ONE_HOUR_MS
        ),
      endTime: Yup.string()
        .required(required('createEvent.eventEndTime'))
        .test('end-after-start', intl.formatMessage({ id: 'createEvent.errors.endTimeAfterStart' }), function (value) {
          return isAfter(value, this.parent.startTime);
        }),
      ticketSaleStartTime: Yup.string().required(required('createEvent.ticketSaleStart')),
      ticketSaleEndTime: Yup.string()
        .required(required('createEvent.ticketSaleEnd'))
        .test('sale-end-after-sale-start', intl.formatMessage({ id: 'createEvent.errors.saleEndAfterSaleStart' }), function (value) {
          return isAfter(value, this.parent.ticketSaleStartTime);
        })
        .test('sale-end-before-event-start', intl.formatMessage({ id: 'createEvent.errors.saleEndBeforeStart' }), function (value) {
          return isBeforeOrEqual(value, this.parent.startTime);
        }),
      ticketTypes: Yup.array()
        .min(1, intl.formatMessage({ id: 'createEvent.errors.ticketTypesEmpty' }))
        .of(
          Yup.object({
            name: Yup.string()
              .trim()
              .required(intl.formatMessage({ id: 'createEvent.errors.ticketNameRequired' })),
            price: Yup.number()
              .typeError(intl.formatMessage({ id: 'createEvent.errors.ticketPriceMin' }))
              .min(0, intl.formatMessage({ id: 'createEvent.errors.ticketPriceMin' }))
              .required(intl.formatMessage({ id: 'createEvent.errors.ticketPriceMin' })),
            totalQuantity: Yup.number()
              .typeError(intl.formatMessage({ id: 'createEvent.errors.ticketQuantityMin' }))
              .min(1, intl.formatMessage({ id: 'createEvent.errors.ticketQuantityMin' }))
              .required(intl.formatMessage({ id: 'createEvent.errors.ticketQuantityMin' }))
            ,
            minPerOrder: Yup.number()
              .typeError(intl.formatMessage({ id: 'createEvent.errors.ticketMinInvalid' }))
              .min(1, intl.formatMessage({ id: 'createEvent.errors.ticketMinInvalid' }))
              .required(intl.formatMessage({ id: 'createEvent.errors.ticketMinInvalid' })),
            maxPerOrder: Yup.number()
              .typeError(intl.formatMessage({ id: 'createEvent.errors.ticketMaxInvalid' }))
              .min(1, intl.formatMessage({ id: 'createEvent.errors.ticketMaxInvalid' }))
              .max(Yup.ref('totalQuantity'), intl.formatMessage({ id: 'createEvent.errors.ticketMaxExceedsQuantity' }))
              .required(intl.formatMessage({ id: 'createEvent.errors.ticketMaxInvalid' }))
              .test('max-after-min', intl.formatMessage({ id: 'createEvent.errors.ticketMaxBeforeMin' }), function (value) {
                return value == null || this.parent.minPerOrder == null || value >= this.parent.minPerOrder;
              })
          })
        )
        .test('unique-ticket-names', intl.formatMessage({ id: 'createEvent.errors.duplicateTicketName' }), (tickets: any) => {
          if (!Array.isArray(tickets) || tickets.length === 0) return true;
          const names = tickets.map((ticket: any) =>
            String(ticket?.name ?? '')
              .trim()
              .toLowerCase()
          );
          return new Set(names).size === names.length;
        })
    }),
    Yup.object({}),
    Yup.object({
      bankName: Yup.string().trim().required(required('createEvent.bankName')),
      accountNumber: Yup.string().trim().required(required('createEvent.accountNumber')),
      accountHolder: Yup.string().trim().required(required('createEvent.accountHolder'))
    })
  ];
};

export default function CreateEventPage() {
  const intl = useIntl();
  const [activeStep, setActiveStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [createdEvent, setCreatedEvent] = useState<any>(null);

  const stepValidation = useMemo(() => getValidation(intl), [intl]);
  const stepLabels = useMemo(() => steps.map((key) => intl.formatMessage({ id: key })), [intl]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    getProvinces()
      .then(setProvinces)
      .catch(() => setProvinces([]));
  }, []);

  const handleNext = async (
    validateForm: () => Promise<FormikErrors<CreateEventPayload>>,
    setTouched: (touched: FormikTouched<CreateEventPayload>) => void,
    values: CreateEventPayload
  ) => {
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      const message = findFirstErrorMessage(errors);
      const touched = Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {} as FormikTouched<CreateEventPayload>);
      setTouched(touched);
      if (message) {
        openSnackbar({
          open: true,
          message,
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
      }
      return;
    }

    if (activeStep === steps.length - 1) {
      try {
        const payload: CreateEventPayload = {
          ...values,
          categoryId: Number(values.categoryId),
          provinceId: Number(values.provinceId),
          wardId: Number(values.wardId),
          thumbnailFileId: Number(values.thumbnailFileId),
          bannerFileId: Number(values.bannerFileId)
        };
        const result = await createEvent(payload);
        setCreatedEvent(result);
        setActiveStep(steps.length);
        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'createEvent.success' }),
          variant: 'alert',
          alert: { color: 'success' }
        } as any);
      } catch (err: any) {
        openSnackbar({
          open: true,
          message: getApiErrorMessage(err, intl.formatMessage({ id: 'createEvent.failed' })),
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
      }
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" mb={3}>
        {intl.formatMessage({ id: 'createEvent.title' })}
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {stepLabels.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4 }}>
        <Formik
          initialValues={initialEvent}
          validationSchema={stepValidation[activeStep]}
          validateOnMount={false}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={() => {}}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setTouched, validateForm }) => (
            <>
              {activeStep === 0 && (
                <StepEventInfo
                  values={values}
                  categories={categories}
                  provinces={provinces}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  setFieldValue={setFieldValue}
                />
              )}
              {activeStep === 1 && (
                <StepTickets
                  values={values}
                  ticketTypes={values.ticketTypes}
                  setTicketTypes={(types) => setFieldValue('ticketTypes', types)}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                />
              )}
              {activeStep === 2 && <StepSettings values={values.settings} setValues={(settings) => setFieldValue('settings', settings)} />}
              {activeStep === 3 && (
                <StepPayout values={values.payoutInfo} setValues={(payoutInfo) => setFieldValue('payoutInfo', payoutInfo)} />
              )}
              {activeStep === steps.length && (
                <Summary
                  event={values}
                  ticketTypes={values.ticketTypes}
                  settings={values.settings}
                  bankAccount={values.payoutInfo}
                  createdEvent={createdEvent}
                />
              )}

              {activeStep < steps.length && (
                <Stack direction="row" justifyContent="space-between" mt={4}>
                  <EventButton
                    variant="outlined"
                    color="secondary"
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep((prev) => prev - 1)}
                  >
                    {intl.formatMessage({ id: 'createEvent.back' })}
                  </EventButton>
                  <EventButton variant="contained" color="primary" onClick={() => handleNext(validateForm, setTouched, values)}>
                    {activeStep === steps.length - 1
                      ? intl.formatMessage({ id: 'createEvent.create' })
                      : intl.formatMessage({ id: 'createEvent.next' })}
                  </EventButton>
                </Stack>
              )}
            </>
          )}
        </Formik>
      </Paper>
    </Container>
  );
}
