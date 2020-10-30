import React from 'react';
import Link from 'next/link';
import { gql, useQuery, NetworkStatus } from '@apollo/client'

export const ALL_MATURITIES_QUERY = gql`
  query maturities {
    maturities(orderBy: maturity) {
      symbol
      name
    }
  }
`

const MaturityList: React.FC = () => {
  const { error, data } = useQuery(ALL_MATURITIES_QUERY);

  if (error) {
    return <pre>{error}</pre>
  }

  return (
    <div>
      <ul>
        {data.maturities.map(maturity => (
          <li key={maturity.symbol}>
            <Link href={`/maturities/${maturity.symbol}`}>{maturity.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MaturityList;
