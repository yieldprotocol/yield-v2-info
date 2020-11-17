const BLOCKS_PER_DAY = 6348;
const FIRST_BLOCK_NUM_NOV_17_UTC = 11272035;
const FIRST_BLOCK_TIME_NOV_17 = new Date('Nov-17-2020 12:00:09 AM');
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const estimateCurrentBlock = () => {
  // @ts-ignore
  const daysSinceNov17 = (new Date() - FIRST_BLOCK_TIME_NOV_17) / (MS_PER_DAY);
  const block = Math.floor(FIRST_BLOCK_NUM_NOV_17_UTC + (BLOCKS_PER_DAY * daysSinceNov17));
  return block;
};

export const estimateBlock24hrAgo = () => estimateCurrentBlock() - BLOCKS_PER_DAY;
