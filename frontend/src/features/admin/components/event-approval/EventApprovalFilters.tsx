// material-ui
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { SearchNormal1 } from 'iconsax-reactjs';
import AdminFilterTabs from 'features/admin/components/AdminFilterTabs';

// types
import { EventStatus } from 'features/admin/types/admin';

// ==============================|| EVENT APPROVAL FILTERS ||============================== //

interface EventApprovalFiltersProps {
  status: EventStatus | 'ALL';
  onStatusChange: (status: EventStatus | 'ALL') => void;
  search: string;
  onSearchChange: (search: string) => void;
  counts: Record<EventStatus | 'ALL', number>;
}

export default function EventApprovalFilters({ status, onStatusChange, search, onSearchChange, counts }: EventApprovalFiltersProps) {
  const intl = useIntl();

  const tabs = [
    { value: 'ALL', label: intl.formatMessage({ id: 'admin.events.filter.all' }, { count: counts.ALL }) },
    { value: 'PENDING', label: intl.formatMessage({ id: 'admin.events.filter.pending' }, { count: counts.PENDING }) },
    { value: 'PUBLISHED', label: intl.formatMessage({ id: 'admin.events.filter.published' }, { count: counts.PUBLISHED }) },
    { value: 'CLOSED', label: intl.formatMessage({ id: 'admin.events.filter.closed' }, { count: counts.CLOSED }) }
  ];

  return (
    <Box
      sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: 'center' }}
    >
      <AdminFilterTabs tabs={tabs} value={status} onChange={(value) => onStatusChange(value as EventStatus | 'ALL')} />
      <OutlinedInput
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={intl.formatMessage({ id: 'admin.events.search' })}
        startAdornment={
          <InputAdornment position="start">
            <SearchNormal1 size={20} />
          </InputAdornment>
        }
        sx={{
          bgcolor: 'secondary.200',
          borderRadius: 2,
          color: 'secondary.darker',
          '& fieldset': { borderColor: 'transparent' },
          '&:hover fieldset': { borderColor: 'secondary.500' },
          '&.Mui-focused fieldset': { borderColor: 'primary.main' },
          minWidth: 320
        }}
      />
    </Box>
  );
}
