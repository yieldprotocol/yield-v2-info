import type { NextApiRequest, NextApiResponse } from 'next'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { gql } from '@apollo/client';

export const APR_QUERY = gql`
  query maturities {
    fydais(orderBy: maturity) {
      apr
    }
  }
`

function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: 'https://api.thegraph.com/subgraphs/name/yieldprotocol/mainnet-staging',
    }),
    cache: new InMemoryCache(),
  })
}

const apr2apy = (apr: number) => Math.pow(Math.E, apr) - 1

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const client = createApolloClient()
    const result = await client.query({ query: APR_QUERY })
    const topAPR = result.data.fydais.reduce((top: number, fyDai: any) =>
      fyDai.apr > top ? parseFloat(fyDai.apr) : top, 0) / 100

    res.json({
      lendRates: [
        {
          apy: apr2apy(topAPR),    // Annual Percentage Yield, multiplier format
          apr: topAPR,  // Annual Percentage Rate, multiplier format
          tokenSymbol: 'DAI', // a symbol of listed currency (3 or 4 capital letters)
        },
      ],
      borrowRates: [
        {
          apy: apr2apy(topAPR),
          apr: topAPR,
          tokenSymbol: 'DAI',
        },
      ],
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
}

export default handler
