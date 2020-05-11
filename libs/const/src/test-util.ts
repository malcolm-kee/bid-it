/* istanbul ignore file */

import type { DealData } from '@app/deal-data';
import { format, add, sub } from 'date-fns';

type DealDataValue = Omit<DealData, 'startedAt' | 'closedAt' | 'closed'> & {
  startedAt: string;
  endedAt: string;
};

export const createDealData = ({
  name = 'Honda Accord 2015',
  startingPrice = 1000,
  startedAt,
  endedAt,
}: Partial<DealDataValue> = {}): DealDataValue => {
  const now = new Date();
  const dateFormat = "yyyy-MM-dd'T'HH:mm:ss";
  const yesterday = format(
    sub(now, {
      days: 1,
    }),
    dateFormat
  );
  const twoHoursLater = format(
    add(now, {
      hours: 2,
    }),
    dateFormat
  );
  return {
    name,
    startingPrice,
    startedAt: startedAt || yesterday,
    endedAt: endedAt || twoHoursLater,
  };
};
