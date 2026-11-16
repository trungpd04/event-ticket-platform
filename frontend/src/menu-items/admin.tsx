// assets
import { CalendarTick, Category2, Element3, Profile2User, ReceiptItem } from 'iconsax-reactjs';

// type
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS - ADMIN ||============================== //

const admin: NavItemType = {
  id: 'group-admin',
  title: 'admin',
  type: 'group',
  roles: ['ADMIN'],
  children: [
    {
      id: 'admin-dashboard',
      title: 'admin.dashboard',
      type: 'item',
      url: '/admin/dashboard',
      icon: Element3
    },
    {
      id: 'admin-event-approval',
      title: 'admin.eventApproval',
      type: 'item',
      url: '/admin/events/approval',
      icon: CalendarTick
    },
    {
      id: 'admin-categories',
      title: 'admin.categories',
      type: 'item',
      url: '/admin/categories',
      icon: Category2
    },
    {
      id: 'admin-fee-policies',
      title: 'admin.feePolicies',
      type: 'item',
      url: '/admin/fee-policies',
      icon: ReceiptItem
    },
    {
      id: 'admin-checkers',
      title: 'admin.checkers',
      type: 'item',
      url: '/admin/checkers',
      icon: Profile2User
    }
  ]
};

export default admin;
