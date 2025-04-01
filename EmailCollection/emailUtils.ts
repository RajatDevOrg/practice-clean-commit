export const generateOrgHeader = (organization: {
  logo_url?: string;
  name: string;
  phone_number?: string;
  email?: string;
  website_url?: string;
}) => `
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
      : ""
  }
  <p style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">
    ${organization.name}
  </p>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="text-align: center; padding: 8px;">${formatPhoneNumber(
        organization.phone_number
      )}</td>
    </tr>
    <tr>
      <td style="text-align: center; padding: 8px;">${formatEmail(
        organization.email
      )}</td>
    </tr>
    <tr>
      <td style="text-align: center; padding: 8px;">${formatWebsiteUrl(
        organization.website_url
      )}</td>
    </tr>
  </table>
</div>
`;

export const formatWebsiteUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  const formattedUrl = url.replace(/\/$/, "");
  const displayUrl = formattedUrl.replace(/^https?:\/\//, "");
  return `<a href="${formattedUrl}" target="_blank" style="color: #0070f3; text-decoration: none;">${displayUrl}</a>`;
};

export const formatEmail = (email: string | null | undefined): string => {
  if (!email) return "";
  return `<a href="mailto:${email}" style="color: #0070f3; text-decoration: none;">${email}</a>`;
};

export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return "";
  const cleanPhone = phone.replace(/\D/g, "");
  return `<a href="tel:${cleanPhone}" style="color: #0070f3; text-decoration: none;">${phone}</a>`;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatMoney = (amount: number | null | undefined) => {
  if (amount == null) return "0.00";
  return Number(amount).toFixed(2);
};
