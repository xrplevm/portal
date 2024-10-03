import {
    formatShortDate,
    formatMinimalDate,
    formatDayMonthYearDate,
    formatDayMonth,
    formatMonth,
    formatMonthYear,
    formatDateTime,
} from "../strategies";
import { DateFormat, FormatStrategy } from "../types";

export const FORMAT_DATE_STRATEGIES: Record<DateFormat, FormatStrategy["formatDate"]> = {
    [DateFormat.SHORT]: formatShortDate,
    [DateFormat.MINIMAL]: formatMinimalDate,
    [DateFormat.DAY_MONTH_YEAR]: formatDayMonthYearDate,
    [DateFormat.DAY_MONTH]: formatDayMonth,
    [DateFormat.MONTH]: formatMonth,
    [DateFormat.MONTH_YEAR]: formatMonthYear,
    [DateFormat.DATE_TIME]: formatDateTime,
};
