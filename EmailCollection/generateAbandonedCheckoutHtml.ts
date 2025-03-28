import { formatInTimeZone } from 'date-fns-tz';

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

interface GenerateAbandonedCheckoutEmailParams {
  customerName: string;
  customerFirstName: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  rvName: string | null;
  rvDetails: any;
  resumeUrl: string;
  organizationSettings: any;
  organization: {
    logo_url: string;
    name: string;
    phone_number: string;
    email: string;
    website_url: string;
    mailgun_email: string;
  };
  isSecondReminder: boolean;
  priceSummary?: any;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatMoney = (amount: number | null | undefined) => {
  if (amount == null) return '0.00';
  return Number(amount).toFixed(2);
};

const combineTaxes = (taxRateCollection: any[]) => {
  const taxMap = new Map();

  (taxRateCollection || []).forEach((tax: any) => {
    const key = `${tax.name}-${tax.rate}-${tax.type}`;
    const existing = taxMap.get(key);
    if (existing) {
      existing.amount += tax.amount;
    } else {
      taxMap.set(key, {
        name: tax.name,
        rate: tax.rate,
        amount: tax.amount,
        type: tax.type,
        source: tax.source,
      });
    }
  });

  return Array.from(taxMap.values()).sort((a, b) => {
    if (a.type === 'RENTAL_VEHICLE' && b.type === 'SALES') return -1;
    if (a.type === 'SALES' && b.type === 'RENTAL_VEHICLE') return 1;
    return 0;
  });
};

const generatePricingTable = (priceSummary: any, organizationSettings: any) => {
  if (!priceSummary) return '';

  const rows: string[] = [];

  // Rental Fee Row
  if (priceSummary?.rentalFee) {
    const baseRate = priceSummary?.selectedUnit?.costPerPeriod || 0;
    rows.push(`
    <tr class="main-row" style="font-size: 0.875rem; background-color: white !important;">
        <td style="padding: 2px 8px;">${
          priceSummary?.selectedUnit?.name || 'RV'
        } Rental Fee</td>
        <td style="text-align: right; padding: 2px 8px;">${priceSummary?.chargePeriods}</td>
        <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
          baseRate,
        )}</td>
        <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
          priceSummary?.rentalFee,
        )}</td>
      </tr>
    `);
  }

  // Mileage Fee Row
  if (priceSummary?.mileageFee) {
    if (priceSummary.manualMileageFee) {
      rows.push(`
        <tr class="main-row" style="font-size: 0.875rem; background-color: white;">
          <td style="padding: 2px 8px;">Mileage Fee</td>
          <td style="text-align: right; padding: 2px 8px;">-</td>
          <td style="text-align: right; padding: 2px 8px;">-</td>
          <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
            priceSummary.mileageFee,
          )}</td>
        </tr>
      `);
    } else if (priceSummary.appliedMileageRule) {
      const billableMiles = priceSummary.billable_miles || 0;
      const mileageRate = priceSummary.appliedMileageRule.tiers[0]?.rate || 0;
      rows.push(`
        <tr class="main-row" style="font-size: 0.875rem; background-color: white;">
          <td style="padding: 2px 8px;">Mileage Fee</td>
          <td style="text-align: right; padding: 2px 8px;">${billableMiles.toFixed(
            2,
          )}</td>
          <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
            mileageRate,
          )}/mile</td>
          <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
            priceSummary.mileageFee,
          )}</td>
        </tr>
      `);
    }
  }

  // Generator Fee Row
  if (priceSummary?.generatorFee && priceSummary.appliedGeneratorRule) {
    const hoursUsed =
      (priceSummary.returnGeneratorHours || 0) -
      (priceSummary.departureGeneratorHours || 0);
    const generatorRate = priceSummary.generatorFee / hoursUsed;
    rows.push(`
      <tr class="main-row" style="font-size: 0.875rem; background-color: white;">
        <td style="padding: 2px 8px;">Generator Fee</td>
        <td style="text-align: right; padding: 2px 8px;">${hoursUsed.toFixed(
          2,
        )}</td>
        <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
          generatorRate,
        )}/hour</td>
        <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
          priceSummary.generatorFee,
        )}</td>
      </tr>
    `);
  }

  // Addon Rows
  (priceSummary?.selectedAddons || []).forEach((addon: any) => {
    rows.push(`
      <tr class="main-row" style="font-size: 0.875rem; background-color: white;">
        <td style="padding: 2px 8px;">${addon.name}</td>
        <td style="text-align: right; padding: 2px 8px;">${addon.quantity}</td>
        <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
          addon.baseFee,
        )}</td>
        <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
          addon.totalFee,
        )}</td>
      </tr>
    `);
  });

  return `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #f3f4f6; font-size: 0.875rem;">
          <th style="text-align: left; padding: 8px;">Description</th>
          <th style="text-align: right; padding: 8px;">Quantity</th>
          <th style="text-align: right; padding: 8px;">Amount</th>
          <th style="text-align: right; padding: 8px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows.join('')}
      </tbody>
    </table>
  `;
};

const generateTaxTable = (priceSummary: any) => {
  if (!priceSummary || !priceSummary.taxRateCollection) return '';

  const taxRows = combineTaxes(priceSummary.taxRateCollection).map(
    (tax) => `
    <tr>
      <td style="text-align: left; padding: 4px 0 4px 40px; font-size: 0.875rem; background-color: white !important;">${
        tax.name
      } (${tax.rate}%):</td>
      <td style="text-align: right; padding: 4px 0; font-size: 0.875rem;  background-color: white !important;">$${formatMoney(
        tax.amount,
      )}</td>
    </tr>
  `,
  );

  return taxRows.join('');
};

export const generateAbandonedCheckoutHtml = ({
  customerName,
  customerFirstName,
  checkInDate,
  checkOutDate,
  rvName,
  rvDetails,
  resumeUrl,
  organizationSettings,
  organization,
  isSecondReminder,
  priceSummary,
}: GenerateAbandonedCheckoutEmailParams): string => {
  const formatUTCDateForDisplay = (
    utcDateString: string | null,
    timezone: string,
    formatString: string,
  ) => {
    if (!utcDateString) return 'Not selected';
    return formatInTimeZone(utcDateString, timezone, formatString);
  };

  const timezone = organizationSettings?.timezone || 'America/New_York';

  // Different content based on whether this is the first or second reminder
  const emailTitle = isSecondReminder
    ? 'Last Chance: Complete Your RV Rental'
    : `Your Reservation with ${organization.name}`;

  const emailIntro = isSecondReminder
    ? `We noticed you still haven't completed your RV booking. Your selected dates are in demand, and we can't guarantee availability much longer.`
    : `Hi ${customerFirstName}, you're almost there! Click the Reserve Now button to complete your reservation, or feel free to call us at the phone number above if you have any questions.`;

  const ctaButtonColor = isSecondReminder ? '#0070f3' : '#0070f3';
  const ctaButtonText = isSecondReminder
    ? 'Complete Your Booking Now'
    : 'Reserve Now';

  // Optional urgency box for second reminder
  const urgencyBox = isSecondReminder
    ? `<div style="border: 2px solid #0070f3; padding: 15px; margin: 20px 0; text-align: center; border-radius: 4px;">
        <p style="margin: 0; font-weight: bold;">Don't miss out! Complete your booking now to secure your perfect RV vacation.</p>
      </div>`
    : '';

  const emailContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${emailTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #000000; }
        .email-container { width: 600px; margin: 0 auto; padding: 10px; }
        .section-header { font-size: 18px; font-weight: 600; margin-bottom: 10px; background-color: #f3f4f6; padding: 10px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f9fafb; font-weight: 600; }
        .main-row { background-color: white !important; }
        .tax-row { background-color: #ffffff !important; font-weight: normal; font-size: 0.875rem; }
        .booking-details { background-color: #f9f9f9; border-radius: 5px; padding: 15px; margin: 20px 0; }
        .cta-button { background-color: ${ctaButtonColor}; color: white; padding: 14px 24px; text-decoration: none; display: inline-block; margin: 20px 0; border-radius: 4px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="email-container">
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
        
        <h1 style="font-size: 20px; color: #333; margin: 0 0 20px 0; text-align: center;">
          ${emailIntro}
        </h1>

        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${rvDetails?.primary_image_url || ''}" alt="${
            rvName || 'RV'
          }" style="max-width: 100%; height: auto; margin-bottom: 20px; border-radius: 8px;">
        </div>

        <div class="section-header">Rental Dates</div>
        <table style="margin-bottom: 20px;">
          <tr>
            <td>
              <strong>Departure</strong><br>
              ${formatUTCDateForDisplay(
                checkInDate,
                timezone,
                'MMM d, yyyy h:mm a',
              )}
            </td>
            <td style="text-align: right;">
              <strong>Return</strong><br>
                ${formatUTCDateForDisplay(
                  checkOutDate,
                  timezone,
                  'MMM d, yyyy h:mm a',
                )}
            </td>
          </tr>
        </table>

        ${
          priceSummary
            ? `
        <div class="section-header">Price Summary</div>
        <div class="overflow-auto max-h-[500px] w-full">
          ${generatePricingTable(priceSummary, organizationSettings)}
        </div>
        <div style="border-top: 1px solid #e5e7eb; margin-top: 1rem; padding-top: 1rem;">
          <table style="width: 100%; font-size: 1rem;">
            <tr>
              <td style="text-align: left; font-weight: bold; padding: 4px 0;">Subtotal:</td>
              <td style="text-align: right; padding: 4px 0; font-weight: bold;">$${formatMoney(
                priceSummary.totalBeforeTax,
              )}</td>
            </tr>
            ${generateTaxTable(priceSummary)}
            <tr>
              <td style="text-align: left; font-weight: bold; padding: 4px 0;  background-color: white !important">Total:</td>
              <td style="text-align: right; font-weight: bold; padding: 4px 0;  background-color: white !important">$${formatMoney(
                priceSummary.grandTotal,
              )}</td>
            </tr>
          </table>
        </div>
        `
            : ''
        }

        ${urgencyBox}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resumeUrl}" class="cta-button">
            ${ctaButtonText}${
              priceSummary
                ? ` for ${formatCurrency(priceSummary.reservationDeposit || 0)}`
                : ''
            }
          </a>
        </div>
        
        <p>We look forward to helping you create unforgettable memories on your upcoming trip!</p>
        
        <p>Best regards,<br>
        The ${organization.name} Team</p>
        
        <div style="margin-top: 30px; font-size: 12px; color: #777;">
          <p>If you did not initiate this booking, please disregard this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return emailContent;
};
