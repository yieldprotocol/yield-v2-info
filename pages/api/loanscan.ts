import type { NextApiRequest, NextApiResponse } from 'next'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { gql } from '@apollo/client';

export const APR_QUERY = gql`
  query maturities($currentTimestamp: Int!) {
    seriesEntities(where: { maturity_gt: $currentTimestamp }) {
      maturity
      baseAsset {
        symbol
      }
      fyToken {
        pools {
          apr
        }
      }
    }
  }
`

function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: 'https://api.thegraph.com/subgraphs/name/yieldprotocol/v2-mainnet',
    }),
    cache: new InMemoryCache(),
  })
}

const apr2apy = (apr: number) => (Math.pow(Math.E, apr / 100) - 1) * 100

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const client = createApolloClient()
    const result = await client.query({
      query: APR_QUERY,
      variables: { currentTimestamp: Math.floor(Date.now() / 1000) },
    })

    const pools: { [symbol: string]: { maxAPR: number, minAPR: number } } = {};

    for (const series of result.data.seriesEntities) {
      if (!pools[series.baseAsset.symbol]) {
        pools[series.baseAsset.symbol] = { maxAPR: 0, minAPR: 100 };
      }

      if (parseFloat(series.fyToken.pools[0].apr) < pools[series.baseAsset.symbol].minAPR) {
        pools[series.baseAsset.symbol].minAPR = parseFloat(series.fyToken.pools[0].apr);
      }
      if (parseFloat(series.fyToken.pools[0].apr) > pools[series.baseAsset.symbol].maxAPR) {
        pools[series.baseAsset.symbol].maxAPR = parseFloat(series.fyToken.pools[0].apr);
      }
    }

    res.json({
      lendRates: Object.entries(pools).map(([symbol, { maxAPR }]) => ({
        apy: apr2apy(maxAPR),
        apr: maxAPR,
        tokenSymbol: symbol,
      })),
      borrowRates: Object.entries(pools).map(([symbol, { minAPR }]) => ({
        apy: apr2apy(minAPR),
        apr: minAPR,
        tokenSymbol: symbol,
      })),
    })
  } catch (e: any) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
}

export default handler
