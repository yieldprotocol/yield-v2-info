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
      id
      symbol
      totalInPools
      totalCollateral
      totalDebt
      totalFYTokens
    }
    fytokens {
      underlyingAsset {
        id
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

const DAI = '0x6b175474e89094c44da98b954eedeac495271d0f'
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const YVCUSDC = '0xa354f35829ae975e850e23e9615b11da1b3dc4de'

const processSubgraphData = (data: any) => {
  const [result, setResult] = useState<any>({ tvl: 0, totalDebt: 0, prices: { [USDC]: 1, [DAI]: 1, [YVCUSDC]: 1 } });

  const getPrices = async (assets: string[]) => {
    const req = await fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', {
      headers: {
        accept: "application/json",
      },
      body: JSON.stringify({
        query: `query {
          usdc: token(id: "${USDC}") {
            derivedETH
          }
          tokens(where: {id_in: [${assets.map(asset => JSON.stringify(asset)).join(',')}]}) {
            id
            derivedETH
          }
        }`,
      }),
      method: "POST",
    });
    const json = await req.json();

    const ethPrice = 1 / json.data.usdc.derivedETH

    const newPrices: any = {}
    for (const token of json.data.tokens) {
      newPrices[token.id] = ethPrice * token.derivedETH;
    }
    setResult((value: any) => ({
      ...value,
      prices: { ...value.prices, ...newPrices },
    }))
  }

  useEffect(() => {
    let tvl = 0;
    let totalDebt = 0;

    let missingAssets: string[] = [];

    for (const asset of data.assets) {
      if (result.prices[asset.id] !== undefined) {
        tvl += (parseFloat(asset.totalInPools) + parseFloat(asset.totalCollateral)) * result.prices[asset.id];
        totalDebt += asset.totalFYTokens * result.prices[asset.id];
      } else {
        missingAssets.push(asset.id)
      }
    }

    for (const fyToken of data.fytokens) {
      if (result.prices[fyToken.underlyingAsset?.id] !== undefined) {
        tvl += fyToken.totalInPools * result.prices[fyToken.underlyingAsset?.id];
      } else if (fyToken.underlyingAsset) {
        missingAssets.push(fyToken.underlyingAsset.id)
      }
    }

    if (missingAssets.length > 0) {
      getPrices(missingAssets)
    }

    setResult((_result: any) => ({ ..._result, tvl, totalDebt }));
  }, [data, result.prices]);

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
