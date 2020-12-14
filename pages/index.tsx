import Head from 'next/head';
import styled from 'styled-components';
import MaturityList, { ALL_MATURITIES_QUERY } from 'components/MaturityList';
import TopVaultsList, { TOP_VAULTS_QUERY } from 'components/TopVaultsList';
import StatBar, { STAT_BAR_QUERY } from 'components/StatBar';
import { initializeApollo } from 'lib/apolloClient';
import { estimateBlock24hrAgo } from 'lib/ethereum';

const Heading = styled.h2`
  font-family: Syne;
  font-weight: bold;
  font-size: 24px;
  color: #ffffff;
`

export default function Home() {
  return (
    <div>
      <Head>
        <title>Borrowing & Lending Statistics - Yield</title>
      </Head>

      <StatBar />
      
      <Heading>Series Information</Heading>
      <MaturityList />

      <Heading>Accounts</Heading>
      <TopVaultsList />
    </div>
  );
};

export async function getStaticProps() {
  const apolloClient = initializeApollo();

  await Promise.all([
    apolloClient.query({ query: ALL_MATURITIES_QUERY, variables: { yesterdayBlock: estimateBlock24hrAgo() } }),
    apolloClient.query({ query: STAT_BAR_QUERY }),
    apolloClient.query({ query: TOP_VAULTS_QUERY }),
  ]);

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
    revalidate: 1,
  };
}
