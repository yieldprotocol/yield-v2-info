import React from 'react';
import styled from 'styled-components';
import { gql, useQuery } from '@apollo/client';

const Bar = styled.div`
  padding: 12px 24px;
  margin: 52px 40px;
  display: flex;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1.5px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  flex: 1;
  padding: 24px 8px;

  display: flex;
  flex-direction: column;

  justify-content: center;
  text-align: center;
  margin: 8px;
`;

const TLV = styled.div`
  font-size: 24px;
  margin-bottom: 4px;
`;

const TLVLabel = styled.div``;

const ValRow = styled.div`
  display: flex;
  font-size: 18px;
`;

const Val = styled.div`
  margin-bottom: 2px;
  flex: 1;
`;

const Label = styled.div``;

const Spacer = styled.div`
  height: 8px;
  flex: 1;
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
      <Card>
        <TLV>${tlv.toLocaleString(undefined, localeOptions)}</TLV>
        <TLVLabel>Total Locked Value (USD)</TLVLabel>
      </Card>

      <Card>
        <ValRow>
          <Val>{parseFloat(collateralETH).toLocaleString(undefined, localeOptions)} ETH</Val>
          <Val>{parseFloat(collateralChai).toLocaleString(undefined, localeOptions)} Chai</Val>
        </ValRow>
        <Label>Collateral</Label>

        <Spacer />

        <ValRow>
          <Val>{parseFloat(data.yield.totalPoolDai).toLocaleString(undefined, localeOptions)} Dai</Val>
          <Val>{parseFloat(data.yield.totalPoolFYDai).toLocaleString(undefined, localeOptions)} fyDai</Val>
        </ValRow>
        <Label>Assets in pools</Label>
      </Card>
    </Bar>
  )
}

export default StatBar;
