import React from 'react';
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, CartesianGrid } from 'recharts';
import { darken } from 'polished';
import format from 'date-fns/format';
import Numeral from 'numeral';

const toK = (num: number) => Numeral(num).format('0.[00]a');

const formattedNum = (number, usd = false, acceptNegatives = false) => {
  if (isNaN(number) || number === '' || number === undefined) {
    return usd ? '$0' : 0
  }
  let num = parseFloat(number)

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0), true)
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
      ? '$' + Number(parseFloat(num).toFixed(0)).toLocaleString()
      : '' + Number(parseFloat(num).toFixed(0)).toLocaleString()
  }

  // if (usd) {
  //   if (num < 0.1) {
  //     return '$' + Number(parseFloat(num).toFixed(4))
  //   } else {
  //     let usdString = priceFormatter.format(num)
  //     return '$' + usdString.slice(1, usdString.length)
  //   }
  // }

  return Number(parseFloat(num).toFixed(5))
}

const toNiceDate = (date) => format(new Date(date * 1000), 'MMM dd');

const toNiceDateYear = (date) => format(new Date(date * 1000), 'MMMM dd, yyyy');

export interface ChartDay {
  date: string;
  dayString: string;
  liquidityUSD: number;
}

interface SeriesChartProps {
  data: ChartDay[];
}

const SeriesCharts: React.FC<SeriesChartProps> = ({ data }) => {
  const color = 'blue';
  const aspect = 60 / 28;
  const textColor = 'white';

  return (
    <ResponsiveContainer aspect={aspect}>
      <AreaChart margin={{ top: 0, right: 10, bottom: 6, left: 0 }} barCategoryGap={1} data={data}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid horizontal={false} stroke="#ffffff52" />
        <XAxis
          tickLine={false}
          axisLine={false}
          interval="preserveEnd"
          tickMargin={14}
          minTickGap={80}
          tickFormatter={(tick) => toNiceDate(tick)}
          dataKey="date"
          tick={{ fill: textColor }}
          type={'number'}
          domain={['dataMin', 'dataMax']}
        />
        <YAxis
          type="number"
          orientation="right"
          tickFormatter={(tick) => '$' + toK(tick)}
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
          formatter={(val) => formattedNum(val, true)}
          labelFormatter={(label) => toNiceDateYear(label)}
          labelStyle={{ paddingTop: 4 }}
          contentStyle={{
            padding: '10px 14px',
            borderRadius: 10,
            borderColor: color,
            color: 'black',
          }}
          wrapperStyle={{ top: -70, left: -10 }}
        />
        <Area
          strokeWidth={2}
          dot={false}
          type="monotone"
          name={' (USD)'}
          dataKey="liquidityUSD"
          yAxisId={0}
          stroke={darken(0.12, color)}
          fill="url(#colorUv)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default SeriesCharts;
