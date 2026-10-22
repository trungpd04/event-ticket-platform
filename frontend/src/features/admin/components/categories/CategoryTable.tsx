// material-ui
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// third-party
import { useIntl } from 'react-intl';

// types
import { Category } from 'features/admin/types/admin';

// ==============================|| CATEGORY TABLE ||============================== //

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
}

export default function CategoryTable({ categories, onEdit }: CategoryTableProps) {
  const intl = useIntl();

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{intl.formatMessage({ id: 'admin.categories.name' })}</TableCell>
            <TableCell>{intl.formatMessage({ id: 'admin.categories.slug' })}</TableCell>
            <TableCell>{intl.formatMessage({ id: 'admin.categories.isActive' })}</TableCell>
            <TableCell align="right">{intl.formatMessage({ id: 'admin.common.actions' })}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.slug || '-'}</TableCell>
              <TableCell>{category.isActive ? 'Yes' : 'No'}</TableCell>
              <TableCell align="right">
                <Button variant="text" color="primary" onClick={() => onEdit(category)}>
                  {intl.formatMessage({ id: 'admin.common.edit' })}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
