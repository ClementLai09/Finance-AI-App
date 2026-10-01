export type MonthRange = {
  month: string;
  currentMonth: string;
  firstDay: string;
  nextMonthStart: string;
  label: string;
};

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number(value.slice(0, 4)) < 1) return false;
  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.valueOf()) && parsedDate.toISOString().slice(0, 10) === value;
}

export function currentMonthKey(now = new Date(), timeZone = "Asia/Kuala_Lumpur"): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}`;
}

export function getMonthRange(requestedMonth?: string, now = new Date()): MonthRange {
  const currentMonth = currentMonthKey(now);
  const selectedMonth = requestedMonth && /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) && requestedMonth <= currentMonth
    ? requestedMonth
    : currentMonth;
  const [yearText, monthText] = selectedMonth.split("-");
  const year = Number(yearText);
  const monthNumber = Number(monthText);
  const firstDay = `${selectedMonth}-01`;
  const nextMonthStart = monthNumber === 12
    ? `${String(year + 1).padStart(4, "0")}-01-01`
    : `${yearText}-${String(monthNumber + 1).padStart(2, "0")}-01`;

  return {
    month: selectedMonth,
    currentMonth,
    firstDay,
    nextMonthStart,
    label: new Intl.DateTimeFormat("en-MY", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${firstDay}T00:00:00Z`)),
  };
}

export function monthStartForDate(now = new Date(), timeZone = "Asia/Kuala_Lumpur"): string {
  return `${currentMonthKey(now, timeZone)}-01`;
}
