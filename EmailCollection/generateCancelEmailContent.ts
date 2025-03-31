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
   <!DOCTYPE html>
    <html lang="en">
     <head>
      <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f9fafb; font-weight: 600; }
      </style>
     </head>
     <body style="margin: 0; padding: 0; overflow-x: hidden; width: 100%; background-color: #f9f9f9; text-align: center; font-family: Arial, sans-serif; line-height: 1.6; color: #000000;">
      <div style="max-width: 600px; width: 100%; margin: 0 auto; padding: 8px; box-sizing: border-box; background-color: white; text-align: left;">
        ${orgHeader}
        <p>Dear ${customerName},</p>
        <p>Your reservation #${reservationNumber} has been cancelled.</p>
        <p>${customMessage}</p>
      </div>
     </body>
    </html>
  `;

  const textContent = `
Dear ${customerName},

Your reservation #${reservationNumber} has been cancelled.

${customMessage}
  `.trim();

  return { htmlContent, textContent };
};

/* export const generateCancelEmailContent = ({
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
   <!DOCTYPE html>
    <html lang="en">
     <head>
  <style>
  table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f9fafb; font-weight: 600; }
  </style>
  </head>
  <body style="margin: 0; padding: 0; overflow-x: hidden;   width: 100% ; background-color: #f9f9f9; text-align: center;  font-family: Arial, sans-serif;
         line-height: 1.6;
         color: #000000;">
      <div style=" max-width: 600px;
            width: 100%;
            margin: 0 auto;
             padding: 8px;
             box-sizing: border-box;
            background-color: white;
            text-align: left; 
            display: inline-block;">
    ${orgHeader}
    <p>Dear ${customerName},</p>
    <p>Your reservation #${reservationNumber} has been cancelled.</p>
    <p>${customMessage}</p>
  `;

  const textContent = `
Dear ${customerName},

Your reservation #${reservationNumber} has been cancelled.

${customMessage}
 </body>
    </html>
  `.trim();

  return { htmlContent, textContent };
}; */
