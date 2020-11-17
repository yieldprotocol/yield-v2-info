import React from 'react';
import styled from 'styled-components';
import { gql, useQuery } from '@apollo/client';

const Bar = styled.dl`
  padding: 12px 24px;
  background: rgba(86, 65, 255, 0.41);
  border-radius: 12px;
  margin: 52px 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Def = styled.dt`
  display: inline-block;
  margin: 0;
  font-weight: bold;
  margin-left: 4px;
  text-align: right;
  padding-right: 3px;
`;

const Val = styled.dd`
  display: inline-block;
  margin: 0;
  margin-right: 4px;
`;


export const STAT_BAR_QUERY = gql`
  query stats {
    yield(id: "1") {
      totalTradingFeesInDai
      totalVolumeDai
      collateralETH
      collateralChai
      totalFYDaiDebt
      totalFYDaiDebtFromETH
      totalFYDaiDebtFromChai
    }
  }
`;

const StatBar = () => {
  const { error, data } = useQuery(STAT_BAR_QUERY);

  if (error || !data) {
    return <pre>{error}</pre>
  }

  // TODO: Convert ETH/Chai to USD
  return (
    <Bar>
      <Def>ETH Collateral:</Def>
      <Val>{parseFloat(data.yield.collateralETH).toFixed(2)} ETH</Val>

      <Def>Chai Collateral:</Def>
      <Val>{parseFloat(data.yield.collateralChai).toFixed(2)}</Val>

      <Def>Dai in Pools:</Def>
      <Val>$140,000</Val>

      <Def>fyDai in Pools:</Def>
      <Val>$140,000</Val>
    </Bar>
  )
}

export default StatBar;
