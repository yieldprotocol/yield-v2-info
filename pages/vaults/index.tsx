import Head from 'next/head';
import React from 'react';
import styled from 'styled-components';
import TopVaultsList, { TOP_VAULTS_QUERY } from 'components/TopVaultsList';
import { initializeApollo } from 'lib/apolloClient';

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
        <title>Top Accounts - Yield</title>
      </Head>

      <HeadingBar>
        <Heading>Accounts</Heading>
      </HeadingBar>

      <TopVaultsList />
    </div>
  )
};

export default SeriesPage;

export async function getStaticProps() {
  const apolloClient = initializeApollo();

  await apolloClient.query({ query: TOP_VAULTS_QUERY });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
    revalidate: 1,
  };
}
