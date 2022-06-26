const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const conceived = new Date(Date.UTC(2022, 2, 9, 2));
const now = new Date();

const diff = now.getTime() - conceived.getTime();

const hiatus = 30;
const returns = 54;

export const ended = 30;

const elapsed = diff / DAY;
export const days = Math.min(elapsed - (returns - hiatus), ended);
