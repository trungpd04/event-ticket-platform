// project-imports
import admin from './admin';
import organizer from './organizer';

// types
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [admin, organizer]
};

export default menuItems;
