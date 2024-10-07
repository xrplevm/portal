export type DateType = Date | string | number;

export enum DateFormat {
    SHORT = "short",
    DATE_TIME = "dateTime",
    MINIMAL = "minimal",
    DAY_MONTH_YEAR = "dayMonthYear",
    DAY_MONTH = "dayMonth",
    MONTH = "month",
    MONTH_YEAR = "monthYear",
}

export type TLocale = string | string[];

export interface FormatStrategy {
    formatDate: (locale: TLocale, date?: Date | string | number | undefined, options?: Intl.DateTimeFormatOptions) => string;
}
