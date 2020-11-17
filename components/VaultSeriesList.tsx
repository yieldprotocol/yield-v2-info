import React from 'react';
import styled from 'styled-components';
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

const Row = styled.li`
  list-style: none;
  display: flex;
  height: 62px;
  box-shadow: 0px 1px 0px rgba(255, 255, 255, 0.16);
  text-decoration: none;
  align-items: center;
  color: #ffffff;
  font-weight: bold;
`;


const formatMaturity = (timestamp: string) => format(new Date(parseInt(timestamp) * 1000), 'MMMM yyyy');

const localeOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

const MaturityList: React.FC<{ data: any }> = ({ data }) => {
  return (
    <Table>
      <Heading>
        <HeadingCol width={80}>APR</HeadingCol>
        <HeadingCol flex={1}>Series</HeadingCol>
        <HeadingCol width={130} flex={0.6}>fyDai</HeadingCol>
      </Heading>

      <TableBody>
        {data.map((vaultSeries: any) => {
          if (vaultSeries.totalFYDaiDebt === '0') {
            return null;
          }

          return (
            <Row key={vaultSeries.fyDai.maturity}>
              <Cell width={80}>
                <APRPill apr={parseFloat(vaultSeries.fyDai.apr)} series={vaultSeries.fyDai.symbol} />
              </Cell>
              <Cell flex={1}>{formatMaturity(vaultSeries.fyDai.maturity)}</Cell>
              <Cell width={130} flex={0.6}>{parseFloat(vaultSeries.totalFYDaiDebt).toLocaleString(undefined, localeOptions)} fyDai</Cell>
            </Row>
          );
        })}
      </TableBody>
    </Table>
  )
}

export default MaturityList;
