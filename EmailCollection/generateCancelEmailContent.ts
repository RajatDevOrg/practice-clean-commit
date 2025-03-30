import { generateOrgHeader } from "./emailUtils";

interface CancelEmailContentProps {
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

export const defaultCancellationMessage =
  "We regret to inform you that your reservation has been cancelled. If you have any questions or concerns, please don't hesitate to contact us.";

export const generateCancelEmailContent = ({
  customerName,
  reservationNumber,
  customMessage,
  organization,
}: CancelEmailContentProps) => {
  const orgHeader = organization
    ? `
       ${generateOrgHeader(organization)}
  `
    : "";

  const htmlContent = `
    ${orgHeader}
    <p>Dear ${customerName},</p>
    <p>Your reservation #${reservationNumber} has been cancelled.</p>
    <p>${customMessage}</p>
  `;

  const textContent = `
Dear ${customerName},

Your reservation #${reservationNumber} has been cancelled.

${customMessage}
  `.trim();

  return { htmlContent, textContent };
};
