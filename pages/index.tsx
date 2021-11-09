import Head from 'next/head';
import styled from 'styled-components';
// import FYDaiChartBox, { NUM_DAYS, FYDAI_CHART_QUERY } from 'components/FYDaiChartBox';
import MaturityList, { ALL_MATURITIES_QUERY } from 'components/MaturityList';
import TopVaultsList, { TOP_VAULTS_QUERY } from 'components/TopVaultsList';
import StatBar, { STAT_BAR_QUERY } from 'components/StatBar';
import { initializeApollo } from 'lib/apolloClient';
import { getBlocksDaysAgoCache, setBlockDaysAgoCache, getBlocksDaysAgo } from 'lib/ethereum';

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
        <title>Borrowing &amp; Lending Statistics - Yield</title>
      </Head>

      <StatBar />

      {/*<FYDaiChartBox />*/}
      
      <Heading>Series Information</Heading>
      <MaturityList />

      <Heading>Vaults</Heading>
      <TopVaultsList />
    </div>
  );
};

export async function getStaticProps() {
  const apolloClient = initializeApollo();

  const [blockNow, blockYesterday] = await getBlocksDaysAgo([0, 1])
  setBlockDaysAgoCache(0, blockNow);
  setBlockDaysAgoCache(1, blockYesterday);

  await Promise.all([
    apolloClient.query({ query: ALL_MATURITIES_QUERY, variables: { blockNow, blockYesterday } }),
    apolloClient.query({ query: STAT_BAR_QUERY }),
    apolloClient.query({ query: TOP_VAULTS_QUERY }),
    // apolloClient.query({ query: FYDAI_CHART_QUERY, variables: getBlockNums(NUM_DAYS) }),
  ]);

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      daysAgoCache: getBlocksDaysAgoCache(),
    },
    revalidate: 5,
  };
}
