import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import MaturityList, { ALL_MATURITIES_QUERY } from 'components/MaturityList';
import { initializeApollo } from 'lib/apolloClient';
import { getBlocksDaysAgoCache, setBlockDaysAgoCache, getBlocksDaysAgo } from 'lib/ethereum';

const HeadingBar = styled.div`
  display: flex;
`;

const Heading = styled.h2`
  font-family: Syne;
  font-weight: bold;
  font-size: 32px;
`;

const SeriesPage = () => {
  return (
    <div>
      <Head>
        <title>Series - Yield</title>
      </Head>

      <HeadingBar>
        <Heading>Series</Heading>
      </HeadingBar>

      <MaturityList />
    </div>
  )
};

export default SeriesPage;

export async function getStaticProps() {
  const apolloClient = initializeApollo();

  const [blockNow, blockYesterday] = await getBlocksDaysAgo([0, 1])
  setBlockDaysAgoCache(0, blockNow);
  setBlockDaysAgoCache(1, blockYesterday);

  await apolloClient.query({ query: ALL_MATURITIES_QUERY, variables: { blockYesterday } });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      daysAgoCache: getBlocksDaysAgoCache(),
    },
    revalidate: 1,
  };
}
