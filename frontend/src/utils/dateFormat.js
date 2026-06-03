/**
 * Centralized date / time formatting for the frontend.
 *
 * Rules:
 *  - Dates are always DD-MM-YYYY
 *  - Time zone is always IST (Asia/Kolkata)
 *  - Time uses 12-hour format with AM/PM
 */

const IST = "Asia/Kolkata";

/**
 * DD-MM-YYYY  (e.g. "03-06-2026")
 */
export const formatDateDMY = (value) => {
  if (!value) return "";
  return new Date(value)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: IST,
    })
    .replace(/\//g, "-");
};

/**
 * DD Mon YYYY  (e.g. "03 Jun 2026")
 */
export const formatDateShort = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: IST,
  });
};

/**
 * DD-MM-YYYY, hh:mm AM/PM  (e.g. "03-06-2026, 08:31 pm")
 */
export const formatDateTime = (value) => {
  if (!value) return "";
  const date = formatDateDMY(value);
  const time = new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: IST,
  });
  return `${date}, ${time}`;
};

/**
 * hh:mm AM/PM  (e.g. "08:31 pm")
 */
export const formatTimeIST = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: IST,
  });
};

/**
 * Smart date label for chat — "Today", "Yesterday", weekday, or full date.
 * All comparisons are in IST.
 */
export const formatDateLabel = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const now = new Date();

  // Convert both to IST for day-boundary comparison
  const toIST = (date) =>
    new Date(date.toLocaleString("en-US", { timeZone: IST }));
  const dIST = toIST(d);
  const nowIST = toIST(now);

  const startOfDay = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayMs = 86_400_000;

  const diffDays = Math.floor(
    (startOfDay(nowIST) - startOfDay(dIST)) / dayMs,
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      timeZone: IST,
    });
  }
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: IST,
  });
};

/**
 * Ensure a URL has a protocol prefix so it isn't treated as a relative link.
 */
export const ensureAbsoluteUrl = (url) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};
