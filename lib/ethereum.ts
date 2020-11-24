const BLOCKS_PER_DAY = 6348;
const FIRST_BLOCK_NUM_NOV_17_UTC = 11272035;
const FIRST_BLOCK_TIME_NOV_17 = new Date('Nov-17-2020 12:00:09 AM');
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const estimateCurrentBlock = () => {
  // @ts-ignore
  const daysSinceNov17 = (new Date() - FIRST_BLOCK_TIME_NOV_17) / (MS_PER_DAY);
  const roundedDaysSinceNov17 = Math.round(daysSinceNov17 / 5000) * 5000;
  const block = FIRST_BLOCK_NUM_NOV_17_UTC + (BLOCKS_PER_DAY * roundedDaysSinceNov17);
  return block;
};

export const estimateBlock24hrAgo = () => estimateCurrentBlock() - BLOCKS_PER_DAY;

export const estimateBlockDaysAgo = (numDays: number) => estimateCurrentBlock() - (BLOCKS_PER_DAY * numDays)
