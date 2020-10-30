import styled from 'styled-components';
import MaturityList, { ALL_MATURITIES_QUERY } from 'components/MaturityList';
import { initializeApollo } from 'lib/apolloClient';

const Title = styled.h1`
  color: red;
  font-size: 50px;
`

export default function Home() {
  return (
    <div>
      <Title>My page</Title>
      <MaturityList />
    </div>
  );
};

export async function getStaticProps() {
  const apolloClient = initializeApollo();

  await apolloClient.query({ query: ALL_MATURITIES_QUERY });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
    revalidate: 1,
  };
}
