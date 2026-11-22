// project-imports
import AdminFilterTabs from 'features/admin/components/AdminFilterTabs';

// third-party
import { useIntl } from 'react-intl';

interface EventUpdateRequestFiltersProps {
  status: string;
  onStatusChange: (value: string) => void;
}

export default function EventUpdateRequestFilters({ status, onStatusChange }: EventUpdateRequestFiltersProps) {
  const intl = useIntl();

  const tabs = [
    { value: 'ALL', label: intl.formatMessage({ id: 'admin.common.all' }) },
    { value: 'PENDING_REVIEW', label: intl.formatMessage({ id: 'admin.eventUpdateRequest.status.pendingReview' }) },
    { value: 'APPROVED', label: intl.formatMessage({ id: 'admin.eventUpdateRequest.status.approved' }) },
    { value: 'REJECTED', label: intl.formatMessage({ id: 'admin.eventUpdateRequest.status.rejected' }) }
  ];

  return <AdminFilterTabs tabs={tabs} value={status} onChange={onStatusChange} />;
}
