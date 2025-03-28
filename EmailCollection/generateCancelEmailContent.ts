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
        <div
          style="
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          "
        >
          <div style="flex: 1">
            ${
              organization.logo_url
                ? `
              <div
                style="
                  width: 100%;
                  height: 100px;
                  display: flex;
                  align-items: center;
                  justify-content: flex-start;
                "
              >
                <img
                  src="${organization.logo_url}"
                  alt="${organization.name}"
                  style="
                    max-width: 100%;
                    max-height: 100%;
                    objectFit: contain;
                    width: auto;
                    height: auto;
                  "
                />
              </div>
            `
                : ''
            }
          </div>
          <div style="flex: 1; text-align: right">
            <p
              style="
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 8px;
              "
            >
              ${organization.name}
            </p>
            <p>${organization.phone_number || ''}</p>
            <p>${organization.email || ''}</p>
            <p>${
              organization.website_url
                ? organization.website_url.replace(/\/$/, '')
                : ''
            }</p>
          </div>
        </div>
  `
    : '';

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
