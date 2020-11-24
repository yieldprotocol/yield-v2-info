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
      collateralETH
      collateralETHInUSD
      collateralChai
      collateralChaiInDai
      totalPoolDai
      totalPoolFYDai
      poolTLVInDai
    }
  }
`;

const localeOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

const StatBar = () => {
  const { error, data } = useQuery(STAT_BAR_QUERY);

  if (error || !data) {
    return <pre>{error}</pre>
  }

  const {
    collateralETH, collateralChai, poolTLVInDai, collateralETHInUSD, collateralChaiInDai
  } = data.yield;

  const tlv = parseFloat(poolTLVInDai) + parseFloat(collateralETHInUSD) + parseFloat(collateralChaiInDai);

  return (
    <Bar>
      <Def>Total Locked Value (USD):</Def>
      <Val>${tlv.toLocaleString(undefined, localeOptions)}</Val>

      <Def>ETH Collateral:</Def>
      <Val>{parseFloat(collateralETH).toLocaleString(undefined, localeOptions)} ETH</Val>

      <Def>Chai Collateral:</Def>
      <Val>{parseFloat(collateralChai).toLocaleString(undefined, localeOptions)}</Val>

      <Def>Dai in Pools:</Def>
      <Val>{parseFloat(data.yield.totalPoolDai).toLocaleString(undefined, localeOptions)} Dai</Val>

      <Def>fyDai in Pools:</Def>
      <Val>{parseFloat(data.yield.totalPoolFYDai).toLocaleString(undefined, localeOptions)} fyDai</Val>
    </Bar>
  )
}

export default StatBar;
