import React from 'react';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client'
import format from 'date-fns/format';
import APRPill from 'components/APRPill';
import { initializeApollo } from 'lib/apolloClient';
import backArrow from 'assets/back.svg';

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 40px 0;
  align-items: center;
`;

const BackButton = styled.a`
  display: flex;
  color: #ffffff;
  font-weight: bold;
  font-size: 12px;
  text-decoration: none;
  align-items: center;

  &:before {
    content: '';
    display: block;
    height: 36px;
    width: 36px;
    margin-right: 16px;
    border-radius: 12px;
    background-color: rgba(255, 255, 255, 0.16);
    background-image: url('${backArrow}');
    background-repeat: no-repeat;
    background-position: center;
  }

  &:hover:before {
    background-color: rgba(255, 255, 255, 0.25);
  }
`;

const EtherscanLink = styled.a`
  font-weight: bold;
  font-size: 14px;
  color: #ffffff;
`;

const TitleBar = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.h1`
  font-weight: 600;
  font-size: 24px;
  margin-left: 16px;
`


export const SERIES_QUERY = gql`
  query getMaturity($symbol: String!) {
    fydais(where:{ symbol: $symbol }) {
      address
      symbol
      maturity
      apr
    }
  }
`;

const formatMaturity = (timestamp: string) => format(new Date(parseInt(timestamp) * 1000), 'MMMM yyyy');

const Series: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { error, data } = useQuery(SERIES_QUERY, {
    variables: { symbol },
  });

  if (error) {
    return <pre>{error}</pre>
  }

  if (data.fydais.length === 0) {
    return <div>Not found</div>
  }

  const [fydai] = data.fydais;
  return (
    <div>
      <Toolbar>
        <Link href="/series" passHref>
          <BackButton>Back to series</BackButton>
        </Link>

        <EtherscanLink href={`https://etherscan.io/address/${fydai.address}`}>View on Etherscan</EtherscanLink>
      </Toolbar>

      <TitleBar>
        <APRPill apr={parseFloat(fydai.apr)} series={fydai.symbol} />
        <Title>{formatMaturity(fydai.maturity)}</Title>
      </TitleBar>
    </div>
  );
};

export default Series;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {

  const apolloClient = initializeApollo();

  await apolloClient.query({ query: SERIES_QUERY, variables: { symbol: query.symbol } });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      symbol: query.symbol,
    },
  };
};
