import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject, gql } from '@apollo/client';
import { initializeApollo } from './apolloClient';

const BLOCKS_PER_DAY = 6500;
const ONE_DAY = 24 * 60 * 60;
const FIRST_BLOCK_NUM_NOV_17_UTC = 11272035;
const FIRST_BLOCK_TIME_NOV_17 = new Date('Nov-17-2020 12:00:09 AM');
const MS_PER_DAY = 24 * 60 * 60 * 1000;

let _client: ApolloClient<NormalizedCacheObject> | null = null;
const getClient = () => {
  if (!_client) {
    _client = new ApolloClient({
      ssrMode: typeof window === 'undefined',
      link: new HttpLink({
        uri: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
        credentials: 'same-origin',
      }),
      cache: new InMemoryCache(),
    })
  }
  return _client;
}

export const estimateCurrentBlock = () => {
  // @ts-ignore
  const daysSinceNov17 = (new Date() - FIRST_BLOCK_TIME_NOV_17) / (MS_PER_DAY);
  const roundedDaysSinceNov17 = Math.round(daysSinceNov17 * 5000) / 5000;
  const block = Math.floor(FIRST_BLOCK_NUM_NOV_17_UTC + (BLOCKS_PER_DAY * roundedDaysSinceNov17));
  return block;
};

export const getBlockDaysAgo = async (numDays: number) => {
  if (numDays === 0) {
    const client = initializeApollo()
    const res = await client.query({
      query: gql`{
        _meta {
          block {
            number
          }
        }
      }`,
    });

    return parseInt(res.data._meta.block.number);
  }

  const client = getClient();

  const time = Math.floor((new Date()).getTime() / 1000) - (ONE_DAY * numDays);
  const res = await client.query({
    query: gql`query blocks($timestampFrom: Int!, $timestampTo: Int!) {
      blocks(
        first: 1
        orderBy: timestamp
        orderDirection: asc
        where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
      ) {
        number
      }
    }`,
    variables: {
      timestampFrom: time,
      timestampTo: time + 60 * 60, // 1 hour window
    },
  });

  return parseInt(res.data.blocks[0].number);
};

const daysAgoCache: { [daysAgo: number]: number } = {};

export const setBlockDaysAgoCache = (daysAgo: number, block: number) => {
  daysAgoCache[daysAgo] = block;
}

export const getBlockDaysAgoCache = (daysAgo: number) => daysAgoCache[daysAgo];

const timePeriods = [
  'now',
  'yesterday',
  'twoDaysAgo',
  'threeDaysAgo',
  'fourDaysAgo',
  'fiveDaysAgo',
  'sixDaysAgo',
  'sevenDaysAgo',
  'eightDaysAgo',
  'nineDaysAgo',
];

export const getTimePeriods = (num: number) => {
  if (num >= timePeriods.length) {
    throw new Error('Time periods too large');
  }
  return timePeriods.slice(0, num);
}

export const getBlockNums = (num: number) => {
  const blocks: any = {};
  getTimePeriods(num).map((name: string, i: number) => {
    blocks[`${name}Block`] = getBlockDaysAgoCache(i);
  });
  return blocks;
}
