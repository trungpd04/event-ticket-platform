import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface AdminFilterTab {
  value: string;
  label: string;
}

interface AdminFilterTabsProps {
  tabs: AdminFilterTab[];
  value: string;
  onChange: (value: string) => void;
}

export default function AdminFilterTabs({ tabs, value, onChange }: AdminFilterTabsProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          variant={tab.value === value ? 'contained' : 'text'}
          color="primary"
          onClick={() => onChange(tab.value)}
          size="small"
        >
          {tab.label}
        </Button>
      ))}
    </Box>
  );
}
