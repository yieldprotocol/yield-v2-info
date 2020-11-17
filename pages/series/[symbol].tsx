import React from 'react';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client'
import format from 'date-fns/format';
import APRPill from 'components/APRPill';
import { initializeApollo } from 'lib/apolloClient';
import { estimateBlock24hrAgo, estimateBlock48hrAgo } from 'lib/ethereum';
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
`;

const Hero = styled.div`
  display: flex;
`;

const HeroColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: -24px;
`;

const DataBox = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1.5px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  margin-top: 24px;
  flex: 1;
  padding: 32px;
`;

const GraphPlaceholder = styled.div`
  flex: 2;
  background: rgba(255, 255, 255, 0.02);
  border: 1.5px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  margin-left: 24px;
`;

const DataLabel = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: #979797;
`;

const DataVal = styled.div`
  font-weight: bold;
  font-size: 19px;
  line-height: 23px;
  margin: 8px 0;
`;

const Percent = styled.div<{ negative?: boolean }>`
  font-weight: bold;
  font-size: 15px;
  color: ${props => props.negative ? '#F4B731' : '#6FCF97'};
`;

export const SERIES_QUERY = gql`
  query getMaturity($symbol: String!, $yesterdayBlock: Int!, $twoDaysAgoBlock: Int!) {
    fydais(where:{ symbol: $symbol }) {
      address
      symbol
      maturity
      apr
      poolDaiReserves
      poolFYDaiReserves
      currentFYDaiPriceInDai
      totalVolumeDai
    }

    yesterday: fydais(where: { symbol: $symbol }, block: {number: $yesterdayBlock }) {
      totalVolumeDai
      poolDaiReserves
      poolFYDaiReserves
      currentFYDaiPriceInDai
    }

    twoDaysAgo: fydais(where: { symbol: $symbol }, block: {number: $twoDaysAgoBlock }) {
      totalVolumeDai
    }
  }
`;

const formatMaturity = (timestamp: string) => format(new Date(parseInt(timestamp) * 1000), 'MMMM yyyy');

const formatPercent = (num: number) => `${num > 0 ? '+' : ''}${(num * 100).toFixed(2)}%`;

const calculateLiquidity = (fyDai: any) =>
  parseFloat(fyDai.poolDaiReserves) + (parseFloat(fyDai.poolFYDaiReserves) * parseFloat(fyDai.currentFYDaiPriceInDai));

const localeOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

const Series: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { error, data } = useQuery(SERIES_QUERY, {
    variables: {
      symbol,
      yesterdayBlock: estimateBlock24hrAgo(),
      twoDaysAgoBlock: estimateBlock48hrAgo(),
    },
  });

  if (error) {
    return <pre>{error}</pre>
  }

  if (data.fydais.length === 0) {
    return <div>Not found</div>
  }

  const [fydai] = data.fydais;

  const liquidityNow = calculateLiquidity(fydai);
  const liquidityYesterday = data.yesterday && data.yesterday.length > 0 ? calculateLiquidity(data.yesterday[0]) : 0;
  const liquidityPercentDiff = liquidityYesterday !== 0 ? liquidityNow / liquidityYesterday - 1 : null;

  const totalVolNow = parseFloat(fydai.totalVolumeDai);
  const totalVolYesterday = data.yesterday && data.yesterday.length > 0 ? parseFloat(data.yesterday[0].totalVolumeDai) : 0;
  const totalVolTwoDaysAgo = data.twoDaysAgo && data.twoDaysAgo.length > 0 ? parseFloat(data.twoDaysAgo[0].totalVolumeDai) : 0;
  const volLast24hrs = totalVolNow - totalVolYesterday;
  const volPrevious24hrs = totalVolYesterday - totalVolTwoDaysAgo;
  const volPercentDiff = totalVolYesterday !== 0 && totalVolTwoDaysAgo !== 0 ? volLast24hrs / volPrevious24hrs - 1 : null;

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

      <Hero>
        <HeroColumn>
          <DataBox>
            <DataLabel>Total Liquidity</DataLabel>
            <DataVal>${calculateLiquidity(fydai).toLocaleString(undefined, localeOptions)}</DataVal>
            {liquidityPercentDiff !== null && (
              <Percent negative={liquidityPercentDiff < 0}>{formatPercent(liquidityPercentDiff)}</Percent>
            )}
          </DataBox>

          <DataBox>
            <DataLabel>Volume (24 hrs)</DataLabel>
            <DataVal>${volLast24hrs.toLocaleString(undefined, localeOptions)}</DataVal>
            {volPercentDiff !== null && (
              <Percent negative={volPercentDiff < 0}>{formatPercent(volPercentDiff)}</Percent>
            )}
          </DataBox>
        </HeroColumn>

        <GraphPlaceholder />
      </Hero>
    </div>
  );
};

export default Series;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {

  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: SERIES_QUERY,
    variables: {
      symbol: query.symbol,
      yesterdayBlock: estimateBlock24hrAgo(),
      twoDaysAgoBlock: estimateBlock48hrAgo(),
    },
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      symbol: query.symbol,
    },
  };
};
