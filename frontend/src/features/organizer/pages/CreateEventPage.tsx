import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';

// third-party
import { Formik } from 'formik';
import * as Yup from 'yup';

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
import { BankAccount, Category, CreateEventPayload, EventSettings, Province, TicketType } from 'types/organizer';

const steps = ['Event info', 'Tickets', 'Settings', 'Payout'];

const initialEvent: CreateEventPayload = {
  title: '',
  description: '',
  location: '',
  coverImageUrl: '',
  categoryId: '',
  provinceId: '',
  startTime: '',
  endTime: '',
  ticketSaleStartTime: '',
  ticketSaleEndTime: ''
};

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

export default function CreateEventPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [settings, setSettings] = useState<EventSettings>(initialSettings);
  const [bankAccount, setBankAccount] = useState<BankAccount>(initialBankAccount);
  const [createdEvent, setCreatedEvent] = useState<any>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
    getProvinces().then(setProvinces).catch(() => setProvinces([]));
  }, []);

  const stepValidation = [
    Yup.object({
      title: Yup.string().required('Title is required'),
      location: Yup.string().required('Location is required'),
      categoryId: Yup.number().required('Category is required'),
      provinceId: Yup.number().required('Province is required')
    }),
    Yup.object({
      startTime: Yup.string().required('Start time is required'),
      endTime: Yup.string().required('End time is required'),
      ticketSaleStartTime: Yup.string().required('Ticket sale start is required'),
      ticketSaleEndTime: Yup.string().required('Ticket sale end is required')
    }),
    Yup.object({}),
    Yup.object({})
  ];

  const handleNext = async (validateForm: () => Promise<any>, values: CreateEventPayload) => {
    const errors = await validateForm();
    if (Object.keys(errors).length === 0) {
      if (activeStep === steps.length - 1) {
        try {
          const payload = {
            ...values,
            categoryId: Number(values.categoryId),
            provinceId: Number(values.provinceId)
          };
          const result = await createEvent(payload);
          setCreatedEvent(result);
          setActiveStep(steps.length);
          openSnackbar({
            open: true,
            message: 'Event created successfully!',
            variant: 'alert',
            alert: { color: 'success' }
          } as any);
        } catch (err: any) {
          openSnackbar({
            open: true,
            message: err.message || 'Failed to create event',
            variant: 'alert',
            alert: { color: 'error' }
          } as any);
        }
      } else {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" mb={3}>
        Create new event
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
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
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, validateForm }) => (
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
                  ticketTypes={ticketTypes}
                  setTicketTypes={setTicketTypes}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
              )}
              {activeStep === 2 && <StepSettings values={settings} setValues={setSettings} />}
              {activeStep === 3 && <StepPayout values={bankAccount} setValues={setBankAccount} />}
              {activeStep === steps.length && (
                <Summary
                  event={values}
                  ticketTypes={ticketTypes}
                  settings={settings}
                  bankAccount={bankAccount}
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
                    Back
                  </EventButton>
                  <EventButton variant="contained" color="primary" onClick={() => handleNext(validateForm, values)}>
                    {activeStep === steps.length - 1 ? 'Create event' : 'Next'}
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
