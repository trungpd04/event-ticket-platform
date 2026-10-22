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
import { FeePolicy } from 'features/admin/types/admin';

// ==============================|| FEE POLICY TABLE ||============================== //

interface FeePolicyTableProps {
  feePolicies: FeePolicy[];
  onEdit: (feePolicy: FeePolicy) => void;
}

export default function FeePolicyTable({ feePolicies, onEdit }: FeePolicyTableProps) {
  const intl = useIntl();

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{intl.formatMessage({ id: 'admin.feePolicies.name' })}</TableCell>
            <TableCell>{intl.formatMessage({ id: 'admin.feePolicies.commissionRate' })}</TableCell>
            <TableCell>{intl.formatMessage({ id: 'admin.feePolicies.customerFeeRate' })}</TableCell>
            <TableCell>{intl.formatMessage({ id: 'admin.feePolicies.customerFlatFee' })}</TableCell>
            <TableCell>{intl.formatMessage({ id: 'admin.feePolicies.isActive' })}</TableCell>
            <TableCell>{intl.formatMessage({ id: 'admin.feePolicies.isDefault' })}</TableCell>
            <TableCell align="right">{intl.formatMessage({ id: 'admin.common.actions' })}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {feePolicies.map((policy) => (
            <TableRow key={policy.id}>
              <TableCell>{policy.name}</TableCell>
              <TableCell>{policy.organizerCommissionRate}</TableCell>
              <TableCell>{policy.customerFeeRate}</TableCell>
              <TableCell>{policy.customerFlatFee.toLocaleString()}</TableCell>
              <TableCell>{policy.isActive ? 'Yes' : 'No'}</TableCell>
              <TableCell>{policy.isDefault ? 'Yes' : 'No'}</TableCell>
              <TableCell align="right">
                <Button variant="text" color="primary" onClick={() => onEdit(policy)}>
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
