import format from 'date-fns/format';

// Hack to fix some weirdness around timezones & DST.
// We're only displaying the month so this shouldn't cause problems
const twentyThreeHrs = 23 * 60 * 60 * 1000;

export const formatMaturity = (timestamp: string) =>
  format(parseInt(timestamp) * 1000 - twentyThreeHrs, 'MMMM yyyy');
