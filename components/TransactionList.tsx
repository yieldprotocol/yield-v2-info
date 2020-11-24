import React from 'react';
import styled from 'styled-components';
import { gql, useQuery } from '@apollo/client';
import format from 'date-fns/format';

const Table = styled.div`
  padding: 24px;
  border: 1.5px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
`;

const Heading = styled.div`
  display: flex;
`;

const Cell = styled.div<{ width?: number; flex?: number }>`
  ${props => props.width ? `width: ${props.width}px;` : ''}
  ${props => props.flex ? `flex: ${props.flex};` : ''}
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HeadingCol = styled(Cell)`
  font-weight: 600;
  font-size: 13px;
`;

const TableBody = styled.ul`
  margin: 0;
  padding: 0;
`;

const TableLI = styled.li`
  list-style: none;
  display: flex;
  box-shadow: 0px 1px 0px rgba(255, 255, 255, 0.16);
  text-decoration: none;
  align-items: center;
  color: #ffffff;
  font-weight: bold;
  padding: 16px 0;

  &:hover {
    background: #1f1d25;
  }
`;

export const SERIES_TX_QUERY = gql`
  query getTransactions($fyDai: String!) {
    trades(where: {fyDai: $fyDai}) {
      id
      from
      amountDai
      amountFYDai
    }
  }
`;

const formatMaturity = (timestamp: string) => format(new Date(parseInt(timestamp) * 1000), 'MMMM yyyy');

const localeOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

interface TransactionListProps {
  fyDai: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ fyDai }) => {
  const { error, data } = useQuery(SERIES_TX_QUERY, { variables: { fyDai }});

  if (error || !data) {
    return <pre>{error}</pre>
  }

  return (
    <Table>
      <Heading>
        <HeadingCol width={80} flex={0.8}>Action</HeadingCol>
        <HeadingCol width={80} flex={0.5}>Dai</HeadingCol>
        <HeadingCol width={80} flex={1}>fyDai</HeadingCol>
        <HeadingCol width={100} flex={0.4}>Account</HeadingCol>
        <HeadingCol width={100} flex={0.4}>Time</HeadingCol>
      </Heading>

      <TableBody>
        {data.trades.map((trade: any) => (
          <TableLI key={trade.id}>
            <Cell width={80} flex={0.8}>
              Swap {trade.amountDai < 0 ? 'Dai' : 'fyDai'} for {trade.amountDai < 0 ? 'fyDai' : 'Dai'}
            </Cell>
            <Cell width={80} flex={0.5}>${parseFloat(trade.amountDai).toLocaleString(undefined, localeOptions)}</Cell>
            <Cell width={80} flex={0.5}>${parseFloat(trade.amountFYDai).toLocaleString(undefined, localeOptions)}</Cell>
            <Cell width={100} flex={1}>{trade.from}</Cell>
            <Cell width={100} flex={0.4}>5 minutes ago</Cell>
          </TableLI>
        ))}
      </TableBody>
    </Table>
  )
}

export default TransactionList;
