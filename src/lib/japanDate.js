const JAPAN_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

/** Return the calendar date in Japan for a Date instant. */
export function japanDateParts(referenceDate = new Date()) {
  if (!(referenceDate instanceof Date) || Number.isNaN(referenceDate.getTime())) return null;

  const values = Object.fromEntries(
    JAPAN_DATE_FORMATTER.formatToParts(referenceDate)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  );

  return { year: values.year, month: values.month, day: values.day };
}
