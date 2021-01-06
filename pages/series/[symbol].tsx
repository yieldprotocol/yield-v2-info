import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client'
import { formatMaturity } from 'lib/format';
import APRPill from 'components/APRPill';
import SeriesCharts, { ChartDay } from 'components/SeriesCharts';
import TransactionList, { SERIES_TX_QUERY, NUM_ROWS, MAX_TIMESTAMP } from 'components/TransactionList';
import { initializeApollo } from 'lib/apolloClient';
import { getTimePeriods, getBlockNums } from 'lib/ethereum';
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

  @media (max-width: 768px) {
    flex-direction: column;
  }
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
  padding: 24px;
`;

const GraphContainer = styled.div`
  flex: 2;
  background: rgba(255, 255, 255, 0.02);
  border: 1.5px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  margin-left: 24px;
  padding: 32px;

  @media (max-width: 768px) {
    margin-top: 24px;
    margin-left: 0;
  }
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

const Heading = styled.h2`
  font-family: Syne;
  font-weight: bold;
  font-size: 24px;
  color: #ffffff;
`;

const NUM_DAYS = 9;

const timePeriods = getTimePeriods(NUM_DAYS);

const SERIES_QUERY = gql`
  query getMaturity($symbol: String!, ${timePeriods.slice(1).map((name: string) => `$${name}Block: Int!`).join(', ')}) {
    now: fydais(where:{ symbol: $symbol }) {
      id
      address
      symbol
      maturity
      apr
      totalSupply
      poolDaiReserves
      poolFYDaiReserves
      currentFYDaiPriceInDai
      totalVolumeDai
    }

    ${timePeriods.slice(1).map((name: string) => `
      ${name}: fydais(where: { symbol: $symbol }, block: {number: $${name}Block }) {
        totalSupply
        totalVolumeDai
        poolDaiReserves
        poolFYDaiReserves
        currentFYDaiPriceInDai
        apr
      }
    `)}
  }
`;

const formatPercent = (num: number) => `${num > 0 ? '+' : ''}${(num * 100).toFixed(2)}%`;

const calculateLiquidity = (fyDai: any) =>
  parseFloat(fyDai.poolDaiReserves) + (parseFloat(fyDai.poolFYDaiReserves) * parseFloat(fyDai.currentFYDaiPriceInDai));

const calculateTotalBorrowed = (fyDai: any) => fyDai.totalSupply * fyDai.currentFYDaiPriceInDai;

const secondsInDay = 24 * 60 * 60;
const todayTimestamp = Math.floor(Date.now() / 1000 / secondsInDay) * secondsInDay;

const createChartData = (fydai: any, daysAgo: number): ChartDay => ({
  date: Math.floor(todayTimestamp - (daysAgo * secondsInDay)).toString(),
  dayString: Math.floor(todayTimestamp - (daysAgo * secondsInDay)).toString(),
  liquidityUSD: calculateLiquidity(fydai),
  apr: parseFloat(fydai.apr),
  borrowed: calculateTotalBorrowed(fydai),
});

const localeOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

const Series: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { error, data } = useQuery(SERIES_QUERY, {
    variables: {
      symbol,
      ...getBlockNums(NUM_DAYS),
    },
  });

  if (error) {
    return <pre>{error}</pre>
  }

  if (data.now.length === 0) {
    return <div>Not found</div>
  }

  const [fydai] = data.now;

  const liquidityNow = calculateLiquidity(fydai);
  const liquidityYesterday = data.yesterday && data.yesterday.length > 0 ? calculateLiquidity(data.yesterday[0]) : 0;
  const liquidityPercentDiff = liquidityYesterday !== 0 ? liquidityNow / liquidityYesterday - 1 : null;

  const totalBorrowedNow = calculateTotalBorrowed(fydai);
  const totalBorrowedYesterday = data.yesterday && data.yesterday.length > 0 ? calculateTotalBorrowed(data.yesterday[0]) : 0;
  const totalBorrowedPercentDiff = totalBorrowedYesterday !== 0 ? totalBorrowedNow / totalBorrowedYesterday - 1 : null;

  const totalVolNow = parseFloat(fydai.totalVolumeDai);
  const totalVolYesterday = data.yesterday && data.yesterday.length > 0 ? parseFloat(data.yesterday[0].totalVolumeDai) : 0;
  const totalVolTwoDaysAgo = data.twoDaysAgo && data.twoDaysAgo.length > 0 ? parseFloat(data.twoDaysAgo[0].totalVolumeDai) : 0;
  const volLast24hrs = totalVolNow - totalVolYesterday;
  const volPrevious24hrs = totalVolYesterday - totalVolTwoDaysAgo;
  const volPercentDiff = volLast24hrs !== 0 && volPrevious24hrs !== 0 ? volLast24hrs / volPrevious24hrs - 1 : null;

  const chartData = timePeriods.map((name: string, i: number) => createChartData(data[name][0], i));

  return (
    <div>
      <Head>
        <title>{formatMaturity(fydai.maturity)} Series - Yield</title>
      </Head>

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
            <DataLabel>Total Borrowed</DataLabel>
            <DataVal>${totalBorrowedNow.toLocaleString(undefined, localeOptions)}</DataVal>
            {totalBorrowedPercentDiff !== null && (
              <Percent negative={totalBorrowedPercentDiff < 0}>
                {formatPercent(totalBorrowedPercentDiff)}
              </Percent>
            )}
          </DataBox>

          <DataBox>
            <DataLabel>Total Liquidity</DataLabel>
            <DataVal>${liquidityNow.toLocaleString(undefined, localeOptions)}</DataVal>
            {liquidityPercentDiff !== null && (
              <Percent negative={liquidityPercentDiff < 0}>
                {formatPercent(liquidityPercentDiff)}
              </Percent>
            )}
          </DataBox>

          <DataBox>
            <DataLabel>Volume (24 hrs)</DataLabel>
            <DataVal>${volLast24hrs.toLocaleString(undefined, localeOptions)}</DataVal>
            {volPercentDiff !== null && (
              <Percent negative={volPercentDiff < 0}>
                {formatPercent(volPercentDiff)}
              </Percent>
            )}
          </DataBox>
        </HeroColumn>

        <GraphContainer>
          <SeriesCharts data={chartData} />
        </GraphContainer>
      </Hero>

      <Heading>Transactions</Heading>
      <TransactionList fyDai={fydai.id} />
    </div>
  );
};

export default Series;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const apolloClient = initializeApollo();

  const result = await apolloClient.query({
    query: SERIES_QUERY,
    variables: {
      symbol: query.symbol,
      ...getBlockNums(NUM_DAYS),
    },
  });
  if (result.data.now.length > 0) {
    await apolloClient.query({
      query: SERIES_TX_QUERY,
      variables: {
        fyDai: result.data.now[0].id,
        limit: NUM_ROWS,
        before: MAX_TIMESTAMP,
      },
    });
  }

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      symbol: query.symbol,
    },
  };
};
