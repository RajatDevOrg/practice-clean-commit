import { formatInTimeZone } from "date-fns-tz";
import { formatCurrency, formatMoney } from "./emailUtils";

interface GenerateQuoteHtmlParams {
  rvDetails: any;
  customerFirstName: string;
  customerLastName: string;
  dates: { checkIn: string; checkOut: string };
  priceSummary: any;
  emailText: string;
  checkoutUrl: string;
  reservationId: string;
  organizationSettings: any;
  organization: any;
}

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
    if (a.type === "RENTAL_VEHICLE" && b.type === "SALES") return -1;
    if (a.type === "SALES" && b.type === "RENTAL_VEHICLE") return 1;
    return 0;
  });
};

const generatePricingTable = (priceSummary: any) => {
  const rows: string[] = [];

  // Rental Fee Row
  if (priceSummary?.rentalFee) {
    const baseRate = priceSummary?.selectedUnit?.costPerPeriod || 0;
    rows.push(`
    <tr class="main-row" style="font-size: 0.875rem; background-color: white !important;">
        <td style="padding: 2px 8px;">${
          priceSummary?.selectedUnit?.name || "RV"
        } Rental Fee</td>
        <td style="text-align: right; padding: 2px 8px;">${
          priceSummary?.chargePeriods
        }</td>
        <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
          baseRate
        )}</td>
        <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
          priceSummary?.rentalFee
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
            priceSummary.mileageFee
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
            2
          )}</td>
          <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
            mileageRate
          )}/mile</td>
          <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
            priceSummary.mileageFee
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
          2
        )}</td>
        <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
          generatorRate
        )}/hour</td>
        <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
          priceSummary.generatorFee
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
          addon.baseFee
        )}</td>
        <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
          addon.totalFee
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
        ${rows.join("")}
      </tbody>
    </table>
  `;
};

const generateTaxTable = (priceSummary: any) => {
  const taxRows = combineTaxes(priceSummary.taxRateCollection).map(
    (tax) => `
    <tr>
      <td style="text-align: left; padding: 4px 0 4px 40px; font-size: 0.875rem; background-color: white !important;">${
        tax.name
      } (${tax.rate}%):</td>
      <td style="text-align: right; padding: 4px 0; font-size: 0.875rem;  background-color: white !important;">$${formatMoney(
        tax.amount
      )}</td>
    </tr>
  `
  );

  return taxRows.join("");
};

// Helper function to format and make URLs clickable
const formatWebsiteUrl = (url: string | null | undefined): string => {
  if (!url) return "";

  // Remove trailing slash
  let formattedUrl = url.replace(/\/$/, "");

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
  const cleanPhone = phone.replace(/\D/g, "");

  // Make it clickable with tel link
  return `<a href="tel:${cleanPhone}" style="color: #0070f3; text-decoration: none;">${phone}</a>`;
};

export const generateQuoteHtml = ({
  rvDetails,
  customerFirstName,
  customerLastName,
  dates,
  priceSummary,
  emailText,
  checkoutUrl,
  reservationId,
  organizationSettings,
  organization,
}: GenerateQuoteHtmlParams): string => {
  const formatUTCDateForDisplay = (
    utcDateString: string,
    timezone: string,
    formatString: string
  ) => {
    return formatInTimeZone(utcDateString, timezone, formatString);
  };

  if (!organizationSettings) {
    return `<div>No org settings? You fucked up.</div>`; // Returns a string of HTML
  }
  const emailContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reservation Quote</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #000000; }
        .email-container { width: 600px; margin: 0 auto; padding: 10px; }
        .section-header { font-size: 18px; font-weight: 600; margin-bottom: 10px; background-color: #f3f4f6; padding: 10px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f9fafb; font-weight: 600; }
        .main-row { background-color: white !important; }
        .tax-row { background-color: #ffffff !important; font-weight: normal; font-size: 0.875rem; }
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
              : ""
          }
          <p style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">
            ${organization.name}
          </p>
 <table style="width: 100%; margin: 8px auto;">            <tr>
              <td style="text-align: center; padding: 0 8px; width: 200px;">${formatPhoneNumber(
                organization.phone_number
              )}</td>
              <td style="text-align: center; padding: 0 8px; width: 200px;">${formatEmail(
                organization.email
              )}</td>
              <td style="text-align: center; padding: 0 8px; width: 200px;">${formatWebsiteUrl(
                organization.website_url
              )}</td>
            </tr>
          </table>
        </div>
        
      <h1 style="font-size: 20px; color: #333; margin: 0 0 20px 0; text-align: center;">
        Hi ${customerFirstName}, here is your quote for the ${
    rvDetails?.name || "RV"
  }<br>  from ${formatUTCDateForDisplay(
    dates.checkIn,
    organizationSettings.timezone,
    "EEEE, MMMM d"
  )} to ${formatUTCDateForDisplay(
    dates.checkOut,
    organizationSettings.timezone,
    "EEEE, MMMM d"
  )}
      </h1>

        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${rvDetails?.primary_image_url || ""}" alt="${
    rvDetails?.name || "RV"
  }" style="max-width: 100%; height: auto; margin-bottom: 20px;  border-radius: 8px;">
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${checkoutUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Reserve Now for ${formatCurrency(priceSummary.reservationDeposit)}
          </a>
        </div>

        <div class="section-header">Rental Dates</div>
        <table style="margin-bottom: 20px;">
          <tr>
            <td>
              <strong>Departure</strong><br>
              ${formatUTCDateForDisplay(
                dates.checkIn,
                organizationSettings.timezone,
                "MMM d, yyyy h:mm a"
              )}
            </td>
            <td style="text-align: right;">
              <strong>Return</strong><br>
                ${formatUTCDateForDisplay(
                  dates.checkOut,
                  organizationSettings.timezone,
                  "MMM d, yyyy h:mm a"
                )}
            </td>
          </tr>
        </table>

        <div class="section-header">Price Summary</div>
        <div class="overflow-auto max-h-[500px] w-full">
    
              ${generatePricingTable(priceSummary)}
          
        </div>
        <div style="border-top: 1px solid #e5e7eb; margin-top: 1rem; padding-top: 1rem;">
          <table style="width: 100%; font-size: 1rem;">
            <tr>
              <td style="text-align: left; font-weight: bold; padding: 4px 0;">Subtotal:</td>
              <td style="text-align: right; padding: 4px 0; font-weight: bold;">$${formatMoney(
                priceSummary.totalBeforeTax
              )}</td>
            </tr>
            ${generateTaxTable(priceSummary)}
            <tr>
              <td style="text-align: left; font-weight: bold; padding: 4px 0;  background-color: white !important">Total:</td>
              <td style="text-align: right; font-weight: bold; padding: 4px 0;  background-color: white !important">$${formatMoney(
                priceSummary.grandTotal
              )}</td>
            </tr>
          </table>
        </div>

        <div class="section-header">Additional Information</div>
        <div style="margin-bottom: 20px;">
          ${emailText.replace(/\n/g, "<br>")}
        </div>
        
        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${checkoutUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Reserve Now for ${formatCurrency(priceSummary.reservationDeposit)}
          </a>
        </div>
      </div>
    </body>
    </html>
  `;

  return emailContent;
};
