// project-imports
import { createEvent } from 'api/events';
import EventWizard from 'features/organizer/components/create-event/EventWizard';
import { initialEvent } from 'features/organizer/utils/eventForm';

// types
import { CreateEventPayload } from 'types/organizer';

// ==============================|| ORGANIZER - CREATE EVENT PAGE ||============================== //

export default function CreateEventPage() {
  const handleSubmit = (payload: CreateEventPayload) => createEvent(payload);

  return (
    <EventWizard
      mode="create"
      initialValues={initialEvent}
      titleId="createEvent.title"
      subtitleId="createEvent.subtitle"
      submitLabelId="createEvent.create"
      successMessageId="createEvent.success"
      errorMessageId="createEvent.failed"
      successHeadingId="createEvent.eventSubmitted"
      onSubmit={handleSubmit}
    />
  );
}
