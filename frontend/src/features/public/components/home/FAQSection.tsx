// material-ui
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { ArrowDown2 } from 'iconsax-reactjs';

// ==============================|| FAQ SECTION ||============================== //

const FAQS = [
  { questionKey: 'home.faq.1.question', answerKey: 'home.faq.1.answer' },
  { questionKey: 'home.faq.2.question', answerKey: 'home.faq.2.answer' },
  { questionKey: 'home.faq.3.question', answerKey: 'home.faq.3.answer' },
  { questionKey: 'home.faq.4.question', answerKey: 'home.faq.4.answer' }
];

export default function FAQSection() {
  const intl = useIntl();

  return (
    <Box sx={{ py: 6, bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        <Typography variant="h4" textAlign="center" mb={4}>
          {intl.formatMessage({ id: 'home.faq.title', defaultMessage: 'Frequently asked questions' })}
        </Typography>
        {FAQS.map((faq, index) => (
          <Accordion key={index} variant="outlined" sx={{ mb: 1, borderRadius: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ArrowDown2 variant="TwoTone" size={20} />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {intl.formatMessage({ id: faq.questionKey })}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {intl.formatMessage({ id: faq.answerKey })}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}
