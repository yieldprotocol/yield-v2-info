import React, { useState } from 'react';
import { Area, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, LineChart, CartesianGrid } from 'recharts';
import { darken } from 'polished';
import format from 'date-fns/format';
import Numeral from 'numeral';
import styled from 'styled-components';

const toK = (num: number | string) => Numeral(num).format('0.[00]a');

const formattedNum = (number: number | string, usd = false) => {
  // @ts-ignore
  if (isNaN(number) || number === '' || number === undefined) {
    return usd ? '$0' : 0
  }
  // @ts-ignore
  let num = parseFloat(number)

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0))
  }

  if (num === 0) {
    if (usd) {
      return '$0'
    }
    return 0
  }

  if (num < 0.0001 && num > 0) {
    return usd ? '< $0.0001' : '< 0.0001'
  }

  if (num > 1000) {
    return usd
      ? '$' + Number(num.toFixed(0)).toLocaleString()
      : '' + Number(num.toFixed(0)).toLocaleString()
  }

  // if (usd) {
  //   if (num < 0.1) {
  //     return '$' + Number(parseFloat(num).toFixed(4))
  //   } else {
  //     let usdString = priceFormatter.format(num)
  //     return '$' + usdString.slice(1, usdString.length)
  //   }
  // }

  return Number(num.toFixed(5))
}

const KeyButton = styled.button`
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.16);
  border: solid 1px transparent;
  color: #cccccc;
  padding: 4px 12px;
  margin: 0 4px;
  outline: none;

  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
  }

  &:disabled {
    background-color: transparent;
    border: solid 1px rgba(255, 255, 255, 0.16);
  }
`;

const toNiceDate = (date: string) => format(new Date(parseInt(date) * 1000), 'MMM dd');

const toNiceDateYear = (date: string) => format(new Date(parseInt(date) * 1000), 'MMMM dd, yyyy');

export interface ChartDay {
  date: string;
  dayString: string;
  liquidityUSD: number;
  apr: number;
}

interface SeriesChartProps {
  data: ChartDay[];
}

const SeriesCharts: React.FC<SeriesChartProps> = ({ data }) => {
  const [key, setKey] = useState('liquidityUSD');
  const color = 'blue';
  const aspect = 60 / 28;
  const textColor = 'white';

  const Chart = key === 'liquidityUSD' ? AreaChart : LineChart;
  const Data = key === 'liquidityUSD' ? Area : Line;

  return (
    <div>
      <div>
        <KeyButton onClick={() => setKey('liquidityUSD')} disabled={key === 'liquidityUSD'}>Liquidity</KeyButton>
        <KeyButton onClick={() => setKey('apr')} disabled={key === 'apr'}>APR</KeyButton>
      </div>
      <ResponsiveContainer aspect={aspect}>
        <Chart margin={{ top: 0, right: 10, bottom: 6, left: 0 }} barCategoryGap={1} data={data}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickMargin={14}
            minTickGap={0}
            tickFormatter={(tick) => toNiceDate(tick)}
            dataKey="date"
            tick={{ fill: textColor }}
            type={'number'}
            domain={['dataMin', 'dataMax']}
          />
          <YAxis
            type="number"
            orientation="right"
            tickFormatter={(tick) => key === 'liquidityUSD' ? '$' + toK(tick) : tick.toFixed(1) + '%'}
            axisLine={false}
            tickLine={false}
            interval="preserveEnd"
            minTickGap={80}
            yAxisId={0}
            tickMargin={16}
            tick={{ fill: textColor }}
          />
          <Tooltip
            cursor={true}
            formatter={(val: any) => key === 'liquidityUSD' ? formattedNum(val, true) : val.toFixed(2) + '%'}
            labelFormatter={(label: any) => toNiceDateYear(label)}
            labelStyle={{ paddingTop: 4 }}
            contentStyle={{
              padding: '10px 14px',
              borderRadius: 10,
              borderColor: color,
              color: 'black',
            }}
            wrapperStyle={{ top: -70, left: -10 }}
          />
          <Data
            strokeWidth={2}
            dot={false}
            type="monotone"
            name={key === 'liquidityUSD' ? ' (USD)' : 'APR'}
            dataKey={key}
            yAxisId={0}
            stroke={darken(0.12, color)}
            fill="url(#colorUv)"
          />
        </Chart>
      </ResponsiveContainer>
    </div>
  )
}

export default SeriesCharts;
