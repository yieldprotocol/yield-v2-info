import React from 'react';
import styled from 'styled-components';
import MaturityList, { ALL_MATURITIES_QUERY } from 'components/MaturityList';
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

  await apolloClient.query({ query: ALL_MATURITIES_QUERY });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
    revalidate: 1,
  };
}
