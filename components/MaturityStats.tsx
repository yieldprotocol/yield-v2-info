import React from 'react';
import Link from 'next/link';
import { gql, useQuery, NetworkStatus } from '@apollo/client'

export const MATURITY_QUERY = gql`
  query getMaturity($symbol: String!) {
    maturities(where:{ symbol: $symbol }) {
      id
      symbol
      name
      maturity
      totalSupply
      pool {
        totalVolumeDai
      }
    }
  }
`

const MaturityStats: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { error, data } = useQuery(MATURITY_QUERY, {
    variables: { symbol },
  });

  if (error) {
    return <pre>{error}</pre>
  }

  if (data.maturities.length === 0) {
    return <div>Not found</div>
  }

  const [maturity] = data.maturities;

  return (
    <div>
      <h1>{maturity.name} ({maturity.symbol})</h1>
      <div><a href={`https://etherscan.io/address/${maturity.id}`} target="etherscan">{maturity.id}</a></div>
    </div>
  )
}

export default MaturityStats;
