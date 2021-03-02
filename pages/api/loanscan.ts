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
    const [topAPR, bottomAPR] = result.data.fydais
      .reduce(([top, bottom]: [number, number], fyDai: any) => {
        let _top = fyDai.apr > top ? parseFloat(fyDai.apr) : top
        let _bottom = fyDai.apr > 0 && fyDai.apr < bottom ? parseFloat(fyDai.apr) : bottom
        return [_top, _bottom]
      }, [0, 100])
      .map((apr: number) => apr / 100)

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
          apy: apr2apy(bottomAPR),
          apr: bottomAPR,
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
