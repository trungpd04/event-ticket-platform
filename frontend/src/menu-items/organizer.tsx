// assets
import { CalendarTick, Ticket2 } from 'iconsax-reactjs';

// type
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS - ORGANIZER ||============================== //

const organizer: NavItemType = {
  id: 'group-organizer',
  title: 'organizer',
  type: 'group',
  roles: ['ORGANIZER'],
  children: [
    {
      id: 'organizer-events',
      title: 'organizer.events.title',
      type: 'item',
      url: '/organizer/events',
      end: true,
      icon: CalendarTick
    },
    {
      id: 'organizer-create-event',
      title: 'organizer.events.create',
      type: 'item',
      url: '/organizer/events/create',
      end: true,
      icon: Ticket2
    }
  ]
};

export default organizer;
