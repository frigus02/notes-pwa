export const MS_SECOND = 1000;
export const MS_MINUTE = MS_SECOND * 60;
export const MS_HOUR = MS_MINUTE * 60;
export const MS_DAY = MS_HOUR * 24;

export function timeAgo(date) {
    const diff = Date.now() - date;
    return diff < MS_MINUTE
        ? "just now"
        : diff < MS_HOUR
        ? `${Math.floor(diff / MS_MINUTE)} mins ago`
        : diff < MS_DAY
        ? `${Math.floor(diff / MS_HOUR)} hours ago`
        : `${Math.floor(diff / MS_DAY)} days ago`;
}
