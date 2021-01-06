import React from 'react';
import styled from 'styled-components';
import { gql, useQuery } from '@apollo/client'
import { getTimePeriods, getBlockNums } from 'lib/ethereum';
import FYDaiChart from './FYDaiChart';

const Card = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1.5px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  flex: 1;
  padding: 16px 24px;

  display: flex;
  flex-direction: column;

  justify-content: center;
  margin: 24px 72px;
`;

export const NUM_DAYS = 9;
const timePeriods = getTimePeriods(NUM_DAYS);

export const FYDAI_CHART_QUERY = gql`
  query getFYDai(${timePeriods.map((name: string) => `$${name}Block: Int!`).join(', ')}) {
    ${timePeriods.map((name: string) => `
      ${name}: yield(id: "1", block: {number: $${name}Block }) {
        totalFYDaiDebtFromETH
      }
    `)}
  }
`;

const secondsInDay = 24 * 60 * 60;
const todayTimestamp = Math.floor(Date.now() / 1000 / secondsInDay) * secondsInDay;

const FYDaiChartBox: React.FC = () => {
  const { error, data } = useQuery(FYDAI_CHART_QUERY, {
    variables: getBlockNums(NUM_DAYS),
  });

  if (error) {
    return <pre>{error}</pre>
  }
  if (!data) {
    return null;
  }

  const chartData = timePeriods.map((name: string, i: number) => ({
    date: Math.floor(todayTimestamp - (i * secondsInDay)).toString(),
    dayString: Math.floor(todayTimestamp - (i * secondsInDay)).toString(),
    totalFYDai: parseFloat(data[name].totalFYDaiDebtFromETH),
  }));

  return (
    <Card>
      <h3>Total fyDai borrowed against ETH collateral</h3>
      <FYDaiChart data={chartData} />
    </Card>
  );
}

export default FYDaiChartBox;
