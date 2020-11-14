import React, { Fragment } from 'react';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client'

export const ALL_MATURITIES_QUERY = gql`
  query maturities {
    fydais(orderBy: maturity) {
      symbol
      name
      maturity
      apr
    }
  }
`

const MaturityList: React.FC = () => {
  const { error, data } = useQuery(ALL_MATURITIES_QUERY);

  if (error) {
    return <pre>{error}</pre>
  }

  const now = Date.now() / 1000;
  const matured = data.fydais.filter(fydai => parseInt(fydai.maturity) < now);
  const active = data.fydais.filter(fydai => parseInt(fydai.maturity) > now);

  return (
    <div>
      <ul>
        {active.map(fydai => (
          <li key={fydai.symbol}>
            <Link href={`/maturities/${fydai.symbol}`}>
              <a>{parseFloat(fydai.apr).toFixed(2)}% - {fydai.name}</a>
            </Link>
          </li>
        ))}
        {matured.length > 0 && (
          <Fragment>
            <li>Matured</li>
            {matured.map(fydai => (
              <li key={fydai.symbol}>
                <Link href={`/maturities/${fydai.symbol}`}>{fydai.name}</Link>
              </li>
            ))}
          </Fragment>
        )}
      </ul>
    </div>
  )
}

export default MaturityList;
