/**
 * Themed HTML email templates for AVERA notifications.
 *
 * All templates use inline CSS that mirrors the site's dark-mode purple
 * glassmorphism aesthetic so the emails look professional and on-brand.
 */

const TYPE_LABELS = {
  assignment1: "Assignment 1",
  assignment2: "Assignment 2",
  classTest1: "Class Test 1",
  classTest2: "Class Test 2",
  presentation: "Presentation",
  research: "Research",
};

export const typeLabel = (type) => TYPE_LABELS[type] || type;

/**
 * Format a date in DD-MM-YYYY, hh:mm AM/PM IST.
 */
const formatDateTimeIST = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const dateStr = d
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    })
    .replace(/\//g, "-");
  const timeStr = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
  return `${dateStr}, ${timeStr} IST`;
};

const formatDateOnlyIST = (value) => {
  if (!value) return "";
  return new Date(value)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    })
    .replace(/\//g, "-");
};

// ─── Base wrapper ────────────────────────────────────────────────────────────

const wrapEmail = ({ preheader, bodyHtml }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AVERA Notification</title>
  <!--[if mso]><style>table,td{font-family:Arial,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0f0c1a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- preheader text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader || ""}&nbsp;</div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f0c1a;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#1c1930;border-radius:24px;border:1px solid rgba(124,92,255,0.25);overflow:hidden;">
        
        <!-- Header -->
        <tr><td style="padding:32px 40px 12px;text-align:center;">
          <h1 style="margin:0;font-size:22px;color:#f4f1ff;font-weight:700;letter-spacing:-0.02em;">
            AVERA
          </h1>
          <p style="margin:4px 0 0;font-size:11px;text-transform:uppercase;letter-spacing:0.25em;color:#9188ad;">
            Student Academic Reminder
          </p>
          <div style="width:50px;height:3px;background:#7c5cff;margin:14px auto 0;border-radius:2px;"></div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:24px 40px 32px;">
          ${bodyHtml}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px 28px;text-align:center;border-top:1px solid rgba(124,92,255,0.15);">
          <p style="color:#6a637f;font-size:11px;margin:0;line-height:1.6;">
            This is an automated notification from AVERA.<br/>
            Please do not reply to this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─── Detail row helper ───────────────────────────────────────────────────────

const detailRow = (label, value) => `
  <tr>
    <td style="padding:6px 0;color:#9188ad;font-size:13px;width:120px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;color:#f4f1ff;font-size:13px;font-weight:500;">${value}</td>
  </tr>`;

const ctaButton = (url, text) => `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0;">
    <tr><td style="background:#7c5cff;border-radius:50px;text-align:center;">
      <a href="${url}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.02em;">
        ${text}
      </a>
    </td></tr>
  </table>`;

const detailCard = (rows) => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(124,92,255,0.08);border-radius:16px;border:1px solid rgba(124,92,255,0.18);margin:20px 0 0;">
    <tr><td style="padding:16px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${rows}
      </table>
    </td></tr>
  </table>`;

// ─── Template: New Reminder ──────────────────────────────────────────────────

export const newReminderEmail = ({
  userName,
  componentType,
  subjectName,
  deadline,
  description,
  viewUrl,
}) => {
  const label = typeLabel(componentType);
  const deadlineStr = formatDateTimeIST(deadline);
  const descText = description || "—";

  const bodyHtml = `
    <p style="color:#b7b0d2;font-size:14px;margin:0 0 6px;">Hello <strong style="color:#f4f1ff;">${userName}</strong>,</p>
    <p style="color:#f4f1ff;font-size:16px;line-height:1.55;margin:0;">
      A new <strong style="color:#7c5cff;">${label}</strong> has been added for
      <strong>${subjectName}</strong>. Please complete it by
      <strong style="color:#ffb4d9;">${deadlineStr}</strong>.
    </p>
    ${detailCard(
      detailRow("Subject", subjectName) +
      detailRow("Type", label) +
      detailRow("Due Date", deadlineStr) +
      detailRow("Description", descText)
    )}
    ${ctaButton(viewUrl, "View Reminders")}`;

  return wrapEmail({
    preheader: `New ${label} for ${subjectName} — due ${deadlineStr}`,
    bodyHtml,
  });
};

// ─── Template: New Attachment ────────────────────────────────────────────────

export const newAttachmentEmail = ({
  userName,
  subjectName,
  componentType,
  attachmentNames,
  viewUrl,
}) => {
  const label = typeLabel(componentType);
  const namesList = (attachmentNames || [])
    .map((n) => `<span style="color:#f4f1ff;">📎 ${n}</span>`)
    .join("<br/>");

  const bodyHtml = `
    <p style="color:#b7b0d2;font-size:14px;margin:0 0 6px;">Hello <strong style="color:#f4f1ff;">${userName}</strong>,</p>
    <p style="color:#f4f1ff;font-size:16px;line-height:1.55;margin:0;">
      A new attachment has been added in <strong style="color:#7c5cff;">${subjectName}</strong>
      under <strong>${label}</strong>. Please check it out.
    </p>
    ${detailCard(
      detailRow("Subject", subjectName) +
      detailRow("Component", label) +
      detailRow("Attachment(s)", namesList || "—")
    )}
    ${ctaButton(viewUrl, "View Subject")}`;

  return wrapEmail({
    preheader: `New attachment in ${subjectName} — ${label}`,
    bodyHtml,
  });
};

// ─── Template: New Event ─────────────────────────────────────────────────────

export const newEventEmail = ({
  userName,
  eventName,
  eventDate,
  description,
  registrationLink,
  viewUrl,
}) => {
  const dateStr = formatDateOnlyIST(eventDate);
  const descText = description || "—";

  let regRow = "";
  if (registrationLink) {
    const href = /^https?:\/\//i.test(registrationLink)
      ? registrationLink
      : `https://${registrationLink}`;
    regRow = detailRow(
      "Register",
      `<a href="${href}" target="_blank" style="color:#7c5cff;text-decoration:underline;">${registrationLink}</a>`
    );
  }

  const bodyHtml = `
    <p style="color:#b7b0d2;font-size:14px;margin:0 0 6px;">Hello <strong style="color:#f4f1ff;">${userName}</strong>,</p>
    <p style="color:#f4f1ff;font-size:16px;line-height:1.55;margin:0;">
      A new event has been created: <strong style="color:#7c5cff;">${eventName}</strong>.
      Check the details below.
    </p>
    ${detailCard(
      detailRow("Event", eventName) +
      detailRow("Date", dateStr) +
      detailRow("Description", descText) +
      regRow
    )}
    ${ctaButton(viewUrl, "View Events")}`;

  return wrapEmail({
    preheader: `New event: ${eventName} on ${dateStr}`,
    bodyHtml,
  });
};
