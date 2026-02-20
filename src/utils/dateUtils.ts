/**
 * Utility functions for handling dates in Argentina timezone (America/Buenos_Aires, UTC-3).
 */

const ARGENTINA_TIMEZONE = 'America/Buenos_Aires';
const ARGENTINA_LOCALE = 'es-AR';

/**
 * Returns the current date in Argentina as a YYYY-MM-DD string (for <input type="date">).
 */
export const getTodayArgentina = (): string => {
    const now = new Date();
    const argentinaDate = new Date(now.toLocaleString('en-US', { timeZone: ARGENTINA_TIMEZONE }));
    const year = argentinaDate.getFullYear();
    const month = String(argentinaDate.getMonth() + 1).padStart(2, '0');
    const day = String(argentinaDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Returns the current Date object adjusted to Argentina timezone.
 */
export const getNowArgentina = (): Date => {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: ARGENTINA_TIMEZONE }));
};

/**
 * Formats a date string (YYYY-MM-DD or DD/MM/YYYY) for display in Argentine format.
 * Input: "2026-11-30" or "30/11/2026"
 * Output: "30/11/2026"
 */
export const formatDateAR = (dateStr: string): string => {
    if (!dateStr || dateStr === 'N/A') return dateStr;

    // Already in DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;

    // YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    }

    // Try to parse and format
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString(ARGENTINA_LOCALE, {
            timeZone: ARGENTINA_TIMEZONE,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
};

/**
 * Formats a date string for long display.
 * Output: "19 de febrero de 2026"
 */
export const formatDateLongAR = (dateStr: string): string => {
    if (!dateStr || dateStr === 'N/A') return dateStr;

    let date: Date;

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [d, m, y] = dateStr.split('/');
        date = new Date(Number(y), Number(m) - 1, Number(d));
    } else {
        date = new Date(dateStr);
    }

    return date.toLocaleDateString(ARGENTINA_LOCALE, {
        timeZone: ARGENTINA_TIMEZONE,
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

/**
 * Returns current time in Argentina formatted as HH:MM.
 */
export const getCurrentTimeAR = (): string => {
    return new Date().toLocaleTimeString(ARGENTINA_LOCALE, {
        timeZone: ARGENTINA_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

/**
 * Formats a number as Argentine currency.
 */
export const formatCurrencyAR = (value: number): string => {
    return `$ ${value.toLocaleString(ARGENTINA_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export { ARGENTINA_TIMEZONE, ARGENTINA_LOCALE };
