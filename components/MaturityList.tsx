import React, { Fragment } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { gql, useQuery } from '@apollo/client';
import Numeral from 'numeral';
import { formatMaturity } from 'lib/format';
import { getBlockDaysAgoCache } from 'lib/ethereum';
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
  query maturities($blockYesterday: Int!) {
    fytokens(orderBy: maturity) {
      id
      symbol
      name
      maturity
      totalSupply
      pools {
        id
        apr
        fyTokenReserves
        baseReserves
        totalTradingFeesInBase
        currentFYTokenPriceInBase
        totalVolumeInBase
      }
      underlyingAsset {
        name
        symbol
      }
    }
    yesterdayPools: pools(block: { number: $blockYesterday }) {
      id
      totalVolumeInBase
    }
  }
`

const calculateLiquidity = (fyDai: any) =>
  fyDai.pools.reduce(
    (acc: number, pool: any) => acc + parseFloat(pool.baseReserves) + (pool.fyTokenReserves * pool.currentFYTokenPriceInBase),
  0)
  // parseFloat(fyDai.poolDaiReserves) + (parseFloat(fyDai.poolFYDaiReserves) * parseFloat(fyDai.currentFYDaiPriceInDai));

const calculateVolume = (pools: any[], yesterdayPools: any) =>
  pools.reduce((total: number, pool: any) => yesterdayPools[pool.id]
    ? total + (pool.totalVolumeInBase - yesterdayPools[pool.id])
    : total,
  0)

const MaturityList: React.FC = () => {
  const { error, data } = useQuery(ALL_MATURITIES_QUERY, {
    variables: {
      blockYesterday: getBlockDaysAgoCache(1),
    },
  });

  if (error || !data) {
    return <pre>{error}</pre>
  }

  const yesterdayVolumesPerPool: { [id: string]: number } = {};

  for (const pool of data.yesterdayPools) {
    yesterdayVolumesPerPool[pool.id] = parseFloat(pool.totalVolumeInBase)
  }

  const now = Date.now() / 1000;
  const matured = data.fytokens.filter((fydai: any) => parseInt(fydai.maturity) < now);
  const active = data.fytokens.filter((fydai: any) => parseInt(fydai.maturity) > now);

  return (
    <Table>
      <Heading>
        <HeadingCol width={80}>APR</HeadingCol>
        <HeadingCol width={80}>Asset</HeadingCol>
        <HeadingCol flex={1}>Series</HeadingCol>
        <HeadingCol width={130} flex={0.6}>Liquidity</HeadingCol>
        <HeadingCol width={120} flex={0.5}>Debt</HeadingCol>
        <HeadingCol width={120} flex={0.5}>Fees Paid</HeadingCol>
      </Heading>

      <TableBody>
        {active.map((fydai: any) => fydai.underlyingAsset && (
          <TableLI key={fydai.id}>
            <Link href={`/series/${fydai.id}`} passHref>
              <TableLink>
                <Cell width={80}>
                  <APRPill apr={parseFloat(fydai.pools[0].apr)} series={fydai.symbol} />
                </Cell>
                <Cell width={80}>{fydai.underlyingAsset?.symbol}</Cell>
                <Cell flex={1}>{formatMaturity(fydai.maturity)}</Cell>
                <Cell width={130} flex={0.6}>
                  {Numeral(calculateLiquidity(fydai)).format('0.[00]a')}
                  {' '}{fydai.underlyingAsset?.symbol}
                </Cell>
                <Cell width={120} flex={0.5}>
                  {Numeral(fydai.totalSupply).format('0.[00]a')}
                  {' '}{fydai.underlyingAsset?.symbol}
                </Cell>
                <Cell width={120} flex={0.5}>
                  {Numeral(fydai.pools
                    .reduce((acc: number, pool: any) => acc + parseFloat(pool.totalTradingFeesInBase), 0)
                  ).format('0.[00]a')}
                  {' '}{fydai.underlyingAsset?.symbol}
                </Cell>
              </TableLink>
            </Link>
          </TableLI>
        ))}

        {matured.length > 0 && (
          <Fragment>
            <TableSubheader>Matured</TableSubheader>

            {matured.map((fydai: any) => (
              <TableLI key={fydai.symbol}>
                <Link href={`/series/${fydai.symbol}`} passHref>
                  <TableLink>
                    <Cell width={80} />
                    <Cell width={80}>{fydai.underlyingAsset?.symbol}</Cell>
                    <Cell flex={1}>{formatMaturity(fydai.maturity)}</Cell>
                    <Cell width={130} flex={0.6}>
                      {Numeral(calculateLiquidity(fydai)).format('0.[00]a')}
                      {' '}{fydai.underlyingAsset?.symbol}
                    </Cell>
                    <Cell width={120} flex={0.5}>
                      {Numeral(fydai.totalSupply).format('0.[00]a')}
                      {' '}{fydai.underlyingAsset?.symbol}
                    </Cell>
                    <Cell width={120} flex={0.5}>
                      {Numeral(fydai.pools
                        .reduce((acc: number, pool: any) => acc + parseFloat(pool.totalTradingFeesInBase), 0)
                      ).format('0.[00]a')}
                      {' '}{fydai.underlyingAsset?.symbol}
                    </Cell>
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
