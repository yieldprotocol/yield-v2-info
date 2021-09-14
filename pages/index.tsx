import Head from 'next/head';
import styled from 'styled-components';
import FYDaiChartBox, { NUM_DAYS, FYDAI_CHART_QUERY } from 'components/FYDaiChartBox';
import MaturityList, { ALL_MATURITIES_QUERY } from 'components/MaturityList';
import TopVaultsList, { TOP_VAULTS_QUERY } from 'components/TopVaultsList';
import StatBar, { STAT_BAR_QUERY } from 'components/StatBar';
import { initializeApollo } from 'lib/apolloClient';
import { getBlockDaysAgo, setBlockDaysAgoCache, getBlockNums } from 'lib/ethereum';

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

      {/*<StatBar />*/}

      {/*<FYDaiChartBox />*/}
      
      <Heading>Series Information</Heading>
      <MaturityList />

      {/*<Heading>Accounts</Heading>
      <TopVaultsList />*/}
    </div>
  );
};

export async function getStaticProps() {
  const apolloClient = initializeApollo();

  // const blockNumsDaysAgo = await Promise.all([...new Array(10)].map(async (_, daysAgo: number) => {
  //   const block = await getBlockDaysAgo(daysAgo);
  //   setBlockDaysAgoCache(daysAgo, block);
  //   return block;
  // }));

  await Promise.all([
    apolloClient.query({ query: ALL_MATURITIES_QUERY }),
    // apolloClient.query({ query: STAT_BAR_QUERY }),
    // apolloClient.query({ query: TOP_VAULTS_QUERY }),
    // apolloClient.query({ query: FYDAI_CHART_QUERY, variables: getBlockNums(NUM_DAYS) }),
  ]);

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      // daysAgoCache: blockNumsDaysAgo,
    },
    revalidate: 5,
  };
}
