export type TimetableEntry = {
  id: number;
  weekday: string;
  ordinal: number;
  periodName: string;
  startTime: string;
  endTime: string;
  subject: string;
  className: string;
  room: string;
  /** True when this entry is the lesson in progress right now. */
  current: boolean;
};

export type PeriodRow = {
  ordinal: number;
  name: string;
  startTime: string;
  endTime: string;
};
