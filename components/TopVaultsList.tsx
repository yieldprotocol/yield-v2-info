import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { gql, useQuery } from '@apollo/client';
import { formatMaturity } from 'lib/format';

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

const Line = styled.div`
  margin: 2px 0;
`;

const TableLI = styled.li`
  list-style: none;
`;

const TableLink = styled.a`
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

export const TOP_VAULTS_QUERY = gql`
  query vaults {
    vaults(orderBy: totalFYDaiDebt, orderDirection: desc, first: 10) {
      id
      collateralETH
      collateralChai
      totalFYDaiDebt
      fyDais(where:{ totalFYDaiDebt_gt: "0"}) {
        fyDai {
          maturity
          currentFYDaiPriceInDai
        }
        totalFYDaiDebt
      }
    }
  }
`;

const totalDebt = (vault: any) => vault.fyDais.reduce((sum: number, fyDai: any) =>
  sum + (parseFloat(fyDai.totalFYDaiDebt) * parseFloat(fyDai.fyDai.currentFYDaiPriceInDai)), 0);

const localeOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

const TopVaultList: React.FC = () => {
  const { error, data } = useQuery(TOP_VAULTS_QUERY);

  if (error || !data) {
    return <pre>{error}</pre>
  }

  return (
    <Table>
      <Heading>
        <HeadingCol width={80} flex={0.8}>Account</HeadingCol>
        <HeadingCol width={100} flex={0.5}>Outstanding Debt</HeadingCol>
        <HeadingCol width={130} flex={1}>Per Series Debt</HeadingCol>
        <HeadingCol width={100} flex={0.4}>Collateral</HeadingCol>
      </Heading>

      <TableBody>
        {data.vaults.map((vault: any) => (
          <TableLI key={vault.id}>
            <Link href={`/vaults/${vault.id}`} passHref>
              <TableLink>
                <Cell width={80} flex={0.8}>{vault.id}</Cell>
                {/* TODO: convert totalFYDaiDebt to totalDaiDebt */}
                <Cell width={100} flex={0.5}>${totalDebt(vault).toLocaleString(undefined, localeOptions)}</Cell>
                <Cell width={130} flex={1}>
                  {vault.fyDais.map((maturity: any) => (
                    <Line key={maturity.fyDai.maturity}>
                      {formatMaturity(maturity.fyDai.maturity)}
                      {' • $'}
                      {(parseFloat(maturity.totalFYDaiDebt) * parseFloat(maturity.fyDai.currentFYDaiPriceInDai)).toLocaleString(undefined, localeOptions)}
                    </Line>
                  ))}
                </Cell>
                <Cell width={100} flex={0.4}>
                  {vault.collateralETH !== '0' && (
                    <Line>{parseFloat(vault.collateralETH).toLocaleString(undefined, localeOptions)} ETH</Line>
                  )}
                  {vault.collateralChai !== '0' && (
                    <Line>{parseFloat(vault.collateralChai).toLocaleString(undefined, localeOptions)} Chai</Line>
                  )}
                </Cell>
              </TableLink>
            </Link>
          </TableLI>
        ))}
      </TableBody>
    </Table>
  )
}

export default TopVaultList;
