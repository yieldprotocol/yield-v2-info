import React, { Fragment } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { gql, useQuery } from '@apollo/client';
import format from 'date-fns/format';
import APRPill from './APRPill';

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
`;

const TableLink = styled.a`
  display: flex;
  height: 62px;
  box-shadow: 0px 1px 0px rgba(255, 255, 255, 0.16);
  text-decoration: none;
  align-items: center;
  color: #ffffff;
  font-weight: bold;

  &:hover {
    background: #1f1d25;
  }
`;

const TableSubheader = styled.li`
  list-style: none;
  font-weight: bold;
  font-size: 15px;
  line-height: 62px;
`

export const ALL_MATURITIES_QUERY = gql`
  query maturities {
    fydais(orderBy: maturity) {
      symbol
      name
      maturity
      apr
    }
  }
`

const formatMaturity = (timestamp: string) => format(new Date(parseInt(timestamp) * 1000), 'MMMM yyyy');

const MaturityList: React.FC = () => {
  const { error, data } = useQuery(ALL_MATURITIES_QUERY);

  if (error || !data) {
    return <pre>{error}</pre>
  }

  const now = Date.now() / 1000;
  const matured = data.fydais.filter(fydai => parseInt(fydai.maturity) < now);
  const active = data.fydais.filter(fydai => parseInt(fydai.maturity) > now);

  return (
    <Table>
      <Heading>
        <HeadingCol width={80}>APR</HeadingCol>
        <HeadingCol flex={1}>Series</HeadingCol>
        <HeadingCol width={120} flex={0.5}>Liquidity</HeadingCol>
        <HeadingCol width={120} flex={0.5}>Volume (24 hrs)</HeadingCol>
        <HeadingCol width={120} flex={0.5}>Fees Paid</HeadingCol>
      </Heading>

      <TableBody>
        {active.map(fydai => (
          <TableLI key={fydai.symbol}>
            <Link href={`/maturities/${fydai.symbol}`} passHref>
              <TableLink>
                <Cell width={80}>
                  <APRPill apr={parseFloat(fydai.apr)} series={fydai.symbol} />
                </Cell>
                <Cell flex={1}>{formatMaturity(fydai.maturity)}</Cell>
                <Cell width={120} flex={0.5}>$140,000</Cell>
                <Cell width={120} flex={0.5}>$29,000</Cell>
                <Cell width={120} flex={0.5}>$95</Cell>
              </TableLink>
            </Link>
          </TableLI>
        ))}

        {matured.length > 0 && (
          <Fragment>
            <TableSubheader>Matured</TableSubheader>

            {matured.map(fydai => (
              <TableLI key={fydai.symbol}>
                <Link href={`/maturities/${fydai.symbol}`} passHref>
                  <TableLink>
                    <Cell width={80} />
                    <Cell flex={1}>{formatMaturity(fydai.maturity)}</Cell>
                    <Cell width={120} flex={0.5}>$140,000</Cell>
                    <Cell width={120} flex={0.5}>$29,000</Cell>
                    <Cell width={120} flex={0.5}>$95</Cell>
                  </TableLink>
                </Link>
              </TableLI>
            ))}
          </Fragment>
        )}
      </TableBody>
    </Table>
  )
}

export default MaturityList;
