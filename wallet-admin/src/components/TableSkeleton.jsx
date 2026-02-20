import React from 'react';
import { TableRow, TableCell, Skeleton, Box } from '@mui/material';

const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <>
      {[...Array(rows)].map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {[...Array(columns)].map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton variant="text" animation="wave" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export default TableSkeleton;