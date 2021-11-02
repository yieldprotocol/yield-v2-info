import React, { useState, useEffect } from 'react';
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
  padding: 12px 8px;

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

const Column = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const STAT_BAR_QUERY = gql`
  query stats {
    assets {
      symbol
      totalInPools
      totalCollateral
      totalDebt
    }
    fytokens {
      underlyingAsset {
        symbol
      }
      totalInPools
      pools {
        baseReserves
        currentFYTokenPriceInBase
      }
    }
  }
`;

const ETH_ORACLE = '0x00c7a37b03690fb9f41b5c5af8131735c7275446';
const BTC_ORACLE = '0xae74faa92cb67a95ebcab07358bc222e33a34da7';

const processSubgraphData = (data: any) => {
  const [result, setResult] = useState<any>({ tvl: 0, totalDebt: 0, prices: { USDC: 1, DAI: 1, USDT: 1 } });

  const getPrices = async () => {
    const req = await fetch('https://gql.graph.chain.link/subgraphs/name/ethereum-mainnet', {
      headers: {
        accept: "application/json",
      },
      body: JSON.stringify({
        query: `query {
  feeds(where: {id_in: ["${ETH_ORACLE}", "${BTC_ORACLE}"]}) {
    id
    rounds (orderBy: number, orderDirection: desc, first: 1) {
      value
    }
  }
}`,
      }),
      method: "POST",
    });
    const json = await req.json();

    for (const feed in json.data.feeds) {
      if (feed.id === ETH_ORACLE) {
        setResult((value: any) => ({ ...value, prices: { ...value.prices, WETH: feed.rounds[0].value / 1e9 } }))
      }
      if (feed.id === BTC_ORACLE) {
        setResult((value: any) => ({ ...value, prices: { ...value.prices, WETH: feed.rounds[0].value / 1e9 } }))
      }
    }
  }

  useEffect(() => {
    let tvl = 0;
    let totalDebt = 0;

    for (const asset of data.assets) {
      if (result.prices[asset.symbol]) {
        tvl += (parseFloat(asset.totalInPools) + parseFloat(asset.totalCollateral)) * result.prices[asset.symbol];
        totalDebt += asset.totalDebt * result.prices[asset.symbol];
      }
    }

    for (const fyToken of data.fytokens) {
      if (result.prices[fyToken.underlyingAsset.symbol]) {
        tvl += fyToken.totalInPools * result.prices[fyToken.underlyingAsset.symbol];
      }
    }

    setResult((_result: any) => ({ ..._result, tvl, totalDebt }));
  }, [data, result.prices]);

  useEffect(() => {
    getPrices();
  }, []);

  return result;
}

const localeOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

const StatBar = () => {
  const { error, data } = useQuery(STAT_BAR_QUERY);

  if (error || !data) {
    return <pre>{error}</pre>
  }

  const { tvl, totalDebt } = processSubgraphData(data);

  return (
    <Bar>
      <Column>
        <Card>
          <TLV>${totalDebt.toLocaleString(undefined, localeOptions)}</TLV>
          <TLVLabel>Total Borrowed (USD)</TLVLabel>
        </Card>
      </Column>

      <Column>
        <Card>
          <TLV>${tvl.toLocaleString(undefined, localeOptions)}</TLV>
          <TLVLabel>Total Value Locked (USD)</TLVLabel>
        </Card>
      </Column>
    </Bar>
  )
}

export default StatBar;
