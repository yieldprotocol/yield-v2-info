import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import MaturityList, { ALL_MATURITIES_QUERY } from 'components/MaturityList';
import { initializeApollo } from 'lib/apolloClient';
import { getBlockDaysAgo, setBlockDaysAgoCache } from 'lib/ethereum';

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

  const blockNumsDaysAgo = await Promise.all([...new Array(10)].map(async (_, daysAgo: number) => {
    const block = await getBlockDaysAgo(daysAgo);
    setBlockDaysAgoCache(daysAgo, block);
    return block;
  }));

  await apolloClient.query({ query: ALL_MATURITIES_QUERY, variables: { yesterdayBlock: blockNumsDaysAgo[1] } });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      daysAgoCache: blockNumsDaysAgo,
    },
    revalidate: 1,
  };
}
