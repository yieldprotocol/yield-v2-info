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
const UNI_ORACLE = '0x68577f915131087199fe48913d8b416b3984fd38';
const LINK_ORACLE = '0xdfd03bfc3465107ce570a0397b247f546a42d0fa';

const ORACLE_SYMBOLS: { [feed: string]: string } = {
  [ETH_ORACLE]: 'WETH',
  [BTC_ORACLE]: 'WBTC',
  [UNI_ORACLE]: 'UNI',
  [LINK_ORACLE]: 'LINK',
}

const processSubgraphData = (data: any) => {
  const [result, setResult] = useState<any>({ tvl: 0, totalDebt: 0, prices: { USDC: 1, DAI: 1, USDT: 1 } });

  const getPrices = async () => {
    const req = await fetch('https://gql.graph.chain.link/subgraphs/name/ethereum-mainnet', {
      headers: {
        accept: "application/json",
      },
      body: JSON.stringify({
        query: `query {
  feeds(where: {id_in: [${Object.keys(ORACLE_SYMBOLS).map(feed => JSON.stringify(feed)).join(',')}]}) {
    id
    rounds (orderBy: number, orderDirection: desc, first: 20, where: { value_not: null }) {
      value
    }
  }
}`,
      }),
      method: "POST",
    });
    const json = await req.json();

    for (const feed of json.data.feeds) {
      if (ORACLE_SYMBOLS[feed.id]) {
        setResult((value: any) => ({
          ...value,
          prices: {
            ...value.prices,
            [ORACLE_SYMBOLS[feed.id]]: feed.rounds[0].value / 1e8,
          },
        }))
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
      if (result.prices[fyToken.underlyingAsset?.symbol]) {
        tvl += fyToken.totalInPools * result.prices[fyToken.underlyingAsset?.symbol];
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
