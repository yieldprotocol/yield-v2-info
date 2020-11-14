import React from 'react';
import Link from 'next/link';
import { gql, useQuery, NetworkStatus } from '@apollo/client'

export const MATURITY_QUERY = gql`
  query getMaturity($symbol: String!) {
    fydais(where:{ symbol: $symbol }) {
      id
      symbol
      name
      maturity
      totalSupply
      apr
      totalVolumeDai
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

  if (data.fydais.length === 0) {
    return <div>Not found</div>
  }

  const [fydai] = data.fydais;

  return (
    <div>
      <h1>{parseFloat(fydai.apr).toFixed(2)}% {fydai.name} ({fydai.symbol})</h1>
      <div><a href={`https://etherscan.io/address/${fydai.id}`} target="etherscan">{fydai.id}</a></div>
    </div>
  )
}

export default MaturityStats;
