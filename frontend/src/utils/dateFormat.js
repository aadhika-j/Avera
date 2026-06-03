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

/**
 * Converts a UTC ISO string to a datetime-local string (YYYY-MM-DDTHH:mm) in IST.
 * This is used for populating <input type="datetime-local"> so it shows the exact IST time.
 */
export const toDatetimeLocalIST = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const utc = d.getTime();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utc + istOffset);
  return istDate.toISOString().slice(0, 16);
};

/**
 * Converts a datetime-local string (YYYY-MM-DDTHH:mm) in IST to a UTC ISO string.
 * This ensures that when a user enters 23:00 IST, it gets stored accurately in UTC.
 */
export const fromDatetimeLocalIST = (localString) => {
  if (!localString) return "";
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utcDateAsIfIST = new Date(localString + "Z");
  const actualUTC = new Date(utcDateAsIfIST.getTime() - istOffset);
  return actualUTC.toISOString();
};

/**
 * Returns a simple string representing the date in IST (e.g., "03/06/2026")
 * Useful for grouping items by day boundaries in IST.
 */
export const getISTDateString = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-IN", { timeZone: IST });
};
