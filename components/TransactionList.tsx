import React, { useState } from 'react';
import Link from 'next/link'
import styled from 'styled-components';
import { gql, useQuery } from '@apollo/client';
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { formatMaturity } from 'lib/format';
import backArrow from 'assets/back.svg';
import forwardArrow from 'assets/forward.svg';

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

const TableLink = styled.a`
  color: #ffffff;
  text-decoration: underline;

  &:hover {
    color: #d4d4d4;
  }
`

const Pagation = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0;
`;

const PageButton = styled.button`
  height: 24px;
  width: 24px;
  margin: 8px;
  border-radius: 8px;
  background-color: transparent;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 18px;
  border: none;
  cursor: pointer;
  outline: none;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.16);
  }
`;

const LeftButton = styled(PageButton)`
  background-image: url('${backArrow}');
`;
const RightButton = styled(PageButton)`
  background-image: url('${forwardArrow}');
`;

export const SERIES_TX_QUERY = gql`
  query getTransactions($fyDai: String!, $before: Int!, $limit: Int!) {
    trades(where: { fyDai: $fyDai, timestamp_lt: $before }, first: $limit, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      from
      amountDai
      amountFYDai
    }
    liquidities(where: { fyDai: $fyDai, timestamp_lt: $before }, first: $limit, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      from
      amountDai
      amountFYDai
    }
    borrows(where: { fyDai: $fyDai, timestamp_lt: $before }, first: $limit, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      from
      amountFYDai
      collateral
    }
  }
`;

export const VAULT_TX_QUERY = gql`
  query getTransactions($vault: String!, $before: Int!, $limit: Int!) {
    trades(where: { from: $vault, timestamp_lt: $before }, first: $limit, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      from
      amountDai
      amountFYDai
      fyDai {
        maturity
        symbol
      }
    }
    liquidities(where: { from: $vault, timestamp_lt: $before }, first: $limit, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      from
      amountDai
      amountFYDai
      fyDai {
        maturity
        symbol
      }
    }
    borrows(where: { from: $vault, timestamp_lt: $before }, first: $limit, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      from
      amountFYDai
      collateral
      fyDai {
        maturity
        symbol
      }
    }
  }
`;

const localeOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

const formatNum = (num: number, prefix: string = '') =>
  isNaN(num) ? '' : prefix + Math.abs(num).toLocaleString(undefined, localeOptions);

const mergeTransactions = (result: any, limit: number) => {
  let transactions: any[] = [];

  if (result.trades) {
    transactions = [...transactions, ...result.trades];
  }
  if (result.trades) {
    transactions = [...transactions, ...result.liquidities];
  }
  if (result.borrows) {
    transactions = [...transactions, ...result.borrows];
  }
  
  transactions = transactions.map((tx: any) => ({
    ...tx,
    timestamp: parseInt(tx.timestamp),
    amountDai: parseFloat(tx.amountDai),
    amountFYDai: parseFloat(tx.amountFYDai),
  }));

  const nextPage = transactions.length > limit;
  transactions = transactions.sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, limit);

  return { transactions, nextPage };
}

const eventAction = (event: any): string => {
  if (event.__typename === 'Trade') {
    return `Swap ${event.amountDai < 0 ? 'Dai' : 'fyDai'} for ${event.amountDai < 0 ? 'fyDai' : 'Dai'}`;
  }
  if (event.__typename === 'Liquidity') {
    return `${event.amountDai > 0 ? 'Add' : 'Remove'} Liquidity`;
  }
  if (event.__typename === 'Borrow') {
    return `${event.amountFYDai > 0 ? 'Borrow' : 'Repay'} against ${event.collateral}`;
  }
  return '';
}

export const NUM_ROWS = 10;
export const MAX_TIMESTAMP = 2000000000

interface TransactionListProps {
  fyDai?: string;
  vault?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ fyDai, vault }) => {
  const [timelimit, setTimelimit] = useState<number[]>([MAX_TIMESTAMP]);
  const currentTimelimit = timelimit[timelimit.length - 1];

  if (!fyDai && !vault) {
    throw new Error('[TransactionList] Must pass fyDai or vault');
  }

  const { error, data } = useQuery(fyDai ? SERIES_TX_QUERY : VAULT_TX_QUERY, {
    variables: {
      fyDai,
      vault,
      limit: NUM_ROWS,
      before: currentTimelimit,
    },
  });

  if (error || !data) {
    return <pre>{error}</pre>
  }

  const { transactions, nextPage } = mergeTransactions(data, NUM_ROWS);

  if (transactions.length === 0) {
    return (
      <Table>No Transactions</Table>
    );
  }

  // Fetch the next page to cache it
  useQuery(fyDai ? SERIES_TX_QUERY : VAULT_TX_QUERY, {
    variables: {
      fyDai,
      vault,
      limit: NUM_ROWS,
      before: transactions[transactions.length - 1].timestamp,
    },
  });

  const newer = () => setTimelimit(timelimit.slice(0, timelimit.length - 1));
  const older = () => setTimelimit([...timelimit, transactions[transactions.length - 1].timestamp]);

  return (
    <Table>
      <Heading>
        <HeadingCol width={80} flex={0.8}>Action</HeadingCol>
        <HeadingCol width={80} flex={0.5}>Dai</HeadingCol>
        <HeadingCol width={80} flex={0.5}>fyDai</HeadingCol>
        <HeadingCol width={100} flex={1}>{fyDai ? 'Account' : 'Series'}</HeadingCol>
        <HeadingCol width={100} flex={0.5}>Time</HeadingCol>
      </Heading>

      <TableBody>
        {transactions.map((tx: any) => (
          <TableLI key={tx.id}>
            <Cell width={80} flex={0.8}>
              <TableLink
                href={`https://etherscan.io/tx/${tx.id.substr(0, tx.id.indexOf('-'))}`}
                target="etherscan"
              >
                {eventAction(tx)}
              </TableLink>
            </Cell>
            <Cell width={80} flex={0.5}>{formatNum(tx.amountDai, '$')}</Cell>
            <Cell width={80} flex={0.5}>{formatNum(tx.amountFYDai)}</Cell>
            <Cell width={100} flex={1}>
              <Link href={fyDai ? `/vaults/${tx.from}` : `/series/${tx.fyDai.symbol}`} passHref>
                <TableLink>{fyDai ? tx.from : formatMaturity(tx.fyDai.maturity)}</TableLink>
              </Link>
            </Cell>
            <Cell width={100} flex={0.5}>{formatDistanceToNow(new Date(tx.timestamp * 1000))} ago</Cell>
          </TableLI>
        ))}
      </TableBody>

      <Pagation>
        <LeftButton disabled={currentTimelimit === MAX_TIMESTAMP} onClick={newer} />
        <span>Page {timelimit.length}</span>
        <RightButton disabled={!nextPage} onClick={older} />
      </Pagation>
    </Table>
  )
}

export default TransactionList;
