// project-imports
import admin from './admin';
import pages from './pages';
import samplePage from './sample-page';
import support from './support';

// types
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [admin, samplePage, pages, support]
};

export default menuItems;
