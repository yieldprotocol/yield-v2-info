import styled from 'styled-components';
import MaturityList, { ALL_MATURITIES_QUERY } from 'components/MaturityList';
import { initializeApollo } from 'lib/apolloClient';

const Heading = styled.h2`
  font-family: Syne;
  font-weight: bold;
  font-size: 24px;
  color: #ffffff;
`

export default function Home() {
  return (
    <div>
      <Heading>Series Information</Heading>
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
