import { TLocale } from "../types";
import { capitalize } from "@peersyst/react-utils";

/**
 * Formats a date to date/time (e.g. June 11, 12:00).
 * @param locale The locale.
 * @param date The date.
 * @param options The options.
 * @returns The formatted date.
 */
export function formatDateTime<T extends TLocale>(
    locale: T,
    date: Date | string | number | undefined = new Date(),
    options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    },
) {
    try {
        if (date === undefined || date === "") return "";
        const finalDate = new Date(date);
        const day = new Intl.DateTimeFormat(locale, { day: options.day }).format(finalDate);
        const month = capitalize(new Intl.DateTimeFormat(locale, { month: options.month }).format(finalDate));
        const year = new Intl.DateTimeFormat(locale, { year: options.year }).format(finalDate);
        const time = new Intl.DateTimeFormat(locale, {
            hour: options.hour,
            minute: options.minute,
            second: options.second,
            hour12: options.hour12,
        }).format(finalDate);
        return `${month} ${day} ${year}, ${time}`;
    } catch (_e) {
        return date?.toString() || "";
    }
}
