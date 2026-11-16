import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useIntl } from 'react-intl';
import { Checker } from 'features/admin/types/admin';

interface CheckerTableProps {
  checkers: Checker[];
  onToggleStatus: (checker: Checker) => void;
}

export default function CheckerTable({ checkers, onToggleStatus }: CheckerTableProps) {
  const intl = useIntl();

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{intl.formatMessage({ id: 'admin.checkers.fullName' })}</TableCell>
            <TableCell>{intl.formatMessage({ id: 'admin.checkers.email' })}</TableCell>
            <TableCell>{intl.formatMessage({ id: 'admin.checkers.phone' })}</TableCell>
            <TableCell>{intl.formatMessage({ id: 'admin.checkers.status' })}</TableCell>
            <TableCell align="right">{intl.formatMessage({ id: 'admin.common.actions' })}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {checkers.map((checker) => {
            const active = checker.status === 'ACTIVE';
            return (
              <TableRow key={checker.id}>
                <TableCell>{checker.fullName}</TableCell>
                <TableCell>{checker.email}</TableCell>
                <TableCell>{checker.phone || '-'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={active ? 'success' : 'error'}
                    label={intl.formatMessage({ id: active ? 'admin.checkers.active' : 'admin.checkers.banned' })}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button variant="text" onClick={() => onToggleStatus(checker)}>
                    {intl.formatMessage({ id: active ? 'admin.checkers.ban' : 'admin.checkers.activate' })}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
