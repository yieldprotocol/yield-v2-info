import styled from 'styled-components';
import MaturityStats, { MATURITY_QUERY } from 'components/MaturityStats';
import { initializeApollo } from 'lib/apolloClient';

const Title = styled.h1`
  color: red;
  font-size: 50px;
`

export default function Home({ symbol }) {
  return (
    <div>
      <Title>My page</Title>
      <MaturityStats symbol={symbol} />
    </div>
  );
};

export async function getServerSideProps({ query }) {
  const apolloClient = initializeApollo();

  await apolloClient.query({ query: MATURITY_QUERY, variables: { symbol: query.symbol } });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      symbol: query.symbol,
    },
  };
}
