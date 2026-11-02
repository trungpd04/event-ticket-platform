// project-imports
import axios from 'utils/axios';

// types
import { Event, PagedResponse } from 'types/organizer';

// ==============================|| ORGANIZER API ||============================== //

export const getOrganizerEvents = async (page = 0, size = 10): Promise<PagedResponse<Event>> => {
  const response = await axios.get('/api/v1/events/organizer/events', {
    params: { page, size }
  });
  return response.data as PagedResponse<Event>;
};

export const requestPublishEvent = async (eventId: number) => {
  const response = await axios.post(`/api/v1/events/${eventId}/request-publish`);
  return response.data;
};
