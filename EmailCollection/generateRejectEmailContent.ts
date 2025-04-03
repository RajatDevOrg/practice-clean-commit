import { generateOrgHeader } from "./emailUtils";

// Helper function to format and make URLs clickable
const formatWebsiteUrl = (url: string | null | undefined): string => {
  if (!url) return "";

  // Remove trailing slash
  let formattedUrl = url.toString().replace(/\/$/, "");

  // Create display version (remove https:// or http://)
  let displayUrl = formattedUrl;
  if (displayUrl.startsWith("https://")) {
    displayUrl = displayUrl.substring(8);
  } else if (displayUrl.startsWith("http://")) {
    displayUrl = displayUrl.substring(7);
  }

  // Make it clickable
  return `<a href="${formattedUrl}" target="_blank" style="color: #0070f3; text-decoration: none;">${displayUrl}</a>`;
};

// Helper function to format and make email addresses clickable
const formatEmail = (email: string | null | undefined): string => {
  if (!email) return "";

  // Make it clickable with mailto link
  return `<a href="mailto:${email}" style="color: #0070f3; text-decoration: none;">${email}</a>`;
};

// Helper function to format and make phone numbers clickable
const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return "";

  // Remove any non-digit characters for the href
  const cleanPhone = phone.toString().replace(/\D/g, "");

  // Make it clickable with tel link
  return `<a href="tel:${cleanPhone}" style="color: #0070f3; text-decoration: none;">${phone}</a>`;
};

interface RejectEmailContentProps {
  customerName: string;
  reservationNumber: string;
  customMessage: string;
  organization?: {
    logo_url: string;
    website_url: string;
    phone_number: string;
    email: string;
    name: string;
  };
}

export const defaultRejectMessage =
  "We're sorry, we are unable to approve your rental request at this time. Please feel free to reach out for more information";

export const generateRejectEmailContent = ({
  customerName,
  reservationNumber,
  customMessage,
  organization,
}: RejectEmailContentProps) => {
  const orgHeader = organization
    ? `
    ${generateOrgHeader(organization)}
  `
    : "";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reservation Request Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #000000; margin: 0; padding: 0; }
        .email-container { width: 600px; margin: 0 auto; padding: 10px; }
      </style>
    </head>
    <!-- update the body and div with "email-container" class to align the content in the center horizontally " -->
  <body style="background-color: #f4f4f4; font-family: Arial, sans-serif; text-align: left; line-height: 1.6; color: #000000; margin: 0; padding: 0;">
  <div class="email-container" style="max-width: 600px; width: 100%; margin: 0 auto; padding: 10px; box-sizing: border-box; background-color: #ffffff;">
        ${orgHeader}
        <p>Dear ${customerName},</p>
        <p>Regarding your reservation request #${reservationNumber}:</p>
        <p>${customMessage}</p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Dear ${customerName},

Regarding your reservation request #${reservationNumber}:

${customMessage}
  `.trim();

  return { htmlContent, textContent };
};
