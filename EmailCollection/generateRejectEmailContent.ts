// Helper function to format and make URLs clickable
const formatWebsiteUrl = (url: string | null | undefined): string => {
  if (!url) return '';

  // Remove trailing slash
  let formattedUrl = url.toString().replace(/\/$/, '');

  // Create display version (remove https:// or http://)
  let displayUrl = formattedUrl;
  if (displayUrl.startsWith('https://')) {
    displayUrl = displayUrl.substring(8);
  } else if (displayUrl.startsWith('http://')) {
    displayUrl = displayUrl.substring(7);
  }

  // Make it clickable
  return `<a href="${formattedUrl}" target="_blank" style="color: #0070f3; text-decoration: none;">${displayUrl}</a>`;
};

// Helper function to format and make email addresses clickable
const formatEmail = (email: string | null | undefined): string => {
  if (!email) return '';

  // Make it clickable with mailto link
  return `<a href="mailto:${email}" style="color: #0070f3; text-decoration: none;">${email}</a>`;
};

// Helper function to format and make phone numbers clickable
const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';

  // Remove any non-digit characters for the href
  const cleanPhone = phone.toString().replace(/\D/g, '');

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
    <div style="margin-bottom: 24px; text-align: center;">
      ${
        organization.logo_url
          ? `
        <div style="width: 100%; margin-bottom: 16px; text-align: center;">
          <img
            src="${organization.logo_url}"
            alt="${organization.name}"
            style="max-width: 100%; max-height: 100px; object-fit: contain; margin: 0 auto;"
          />
        </div>
      `
          : ''
      }
      <p style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">
        ${organization.name}
      </p>
  <table style="width: 100%; margin: 8px auto;">            <tr>
              <td style="text-align: center; padding: 0 8px; width: 200px;">${formatPhoneNumber(
                organization.phone_number,
              )}</td>
              <td style="text-align: center; padding: 0 8px; width: 200px;">${formatEmail(
                organization.email,
              )}</td>
              <td style="text-align: center; padding: 0 8px; width: 200px;">${formatWebsiteUrl(
                organization.website_url,
              )}</td>
            </tr>
          </table>
    </div>
  `
    : '';

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
    <body>
      <div class="email-container">
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
