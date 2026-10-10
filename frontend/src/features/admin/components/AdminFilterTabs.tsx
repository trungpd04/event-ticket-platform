// material-ui
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

// ==============================|| ADMIN FILTER TABS ||============================== //

interface FilterTab {
  value: string;
  label: string;
}

interface AdminFilterTabsProps {
  tabs: FilterTab[];
  value: string;
  onChange: (value: string) => void;
}

export default function AdminFilterTabs({ tabs, value, onChange }: AdminFilterTabsProps) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'secondary.200' }}>
      <Tabs
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        textColor="primary"
        sx={{
          minHeight: 40,
          '& .MuiTabs-flexContainer': {
            gap: 1
          }
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            sx={{
              textTransform: 'none',
              minHeight: 40,
              px: 2,
              py: 1,
              borderRadius: 1,
              color: 'secondary.800',
              fontWeight: 500,
              '&.Mui-selected': {
                color: 'primary.main',
                background: (theme) => `linear-gradient(180deg, ${theme.palette.primary.main}40 0%, transparent 75%)`,
                borderBottom: (theme) => `2px solid ${theme.palette.primary.main}`
              },
              '&:hover': {
                color: 'primary.light'
              }
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
}
