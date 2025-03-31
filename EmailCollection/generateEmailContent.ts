import { formatInTimeZone } from "date-fns-tz";

import { formatDate, safeGet } from "~/lib/utils/formatters";
import { formatEmail, formatPhoneNumber, formatWebsiteUrl } from "./emailUtils";

const getTaxAmount = (taxes: any[], description: string) => {
  const tax = taxes?.find((tax: any) => tax.description === description);
  return tax ? formatMoney(tax.total) : "0.00";
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
    if (a.type === "RENTAL_VEHICLE" && b.type === "SALES") return -1;
    if (a.type === "SALES" && b.type === "RENTAL_VEHICLE") return 1;
    return 0;
  });
};

const generatePricingTable = (priceSummary: any, organizationSettings: any) => {
  const rows: string[] = [];

  const addRow = (
    description: string,
    quantity: string | number,
    unitPrice: string | number,
    total: string | number
  ) => {
    rows.push(`
      <tr class="main-row" style="font-size: 0.875rem; background-color: white !important;">
        <td style="padding: 2px 8px;">${description}</td>
        <td style="text-align: right; padding: 2px 8px;">${quantity}</td>
        <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
          typeof unitPrice === "string" ? parseFloat(unitPrice) : unitPrice
        )}</td>
        <td style="text-align: right; padding: 2px 8px;">$${formatMoney(
          typeof total === "string" ? parseFloat(total) : total
        )}</td>
      </tr>
    `);
  };

  // Rental Fee Row
  if (priceSummary?.rentalFee) {
    const baseRate = priceSummary?.selectedUnit?.costPerPeriod || 0;
    addRow(
      `Rental Fee`,
      priceSummary?.chargePeriods,
      baseRate,
      priceSummary?.rentalFee
    );
  }

  // Mileage Fee Row
  if (priceSummary?.mileageFee) {
    console.log("Mileage Fee:", priceSummary.mileageFee);
    console.log("Manual Mileage Fee:", priceSummary.manualMileageFee);
    console.log("Applied Mileage Rule:", priceSummary.appliedMileageRule);

    if (priceSummary.manualMileageFee) {
      console.log("Pushing manual mileage fee row");
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
      console.log("Pushing calculated mileage fee row");
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
    } else {
      console.log("No mileage fee condition met");
    }
  } else {
    console.log("No mileage fee present in price summary");
  }

  // Addon Rows
  (priceSummary?.selectedAddons || []).forEach((addon: any) => {
    addRow(addon.name, addon.quantity, addon.baseFee, addon.totalFee);
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

export const generateEmailContent = (
  reservation: any,
  priceSummary: any,
  organization: any,
  organizationSettings: any,
  transactions: any[],
  stores: any[],
  emailText?: string
): string => {
  console.log(reservation, "Wow look at that reservation");

  const formatUTCDateForDisplay = (
    utcDateString: string,
    timezone: string,
    formatString: string
  ) => {
    return formatInTimeZone(utcDateString, timezone, formatString);
  };
  const currentTime = formatUTCDateForDisplay(
    new Date().toISOString(),
    organizationSettings.timezone,
    "EEEE, MMMM d, yyyy h:mm a"
  );
  const pickupStore = stores.find(
    (store) => store.id === reservation.store_uuid
  );
  const getStoreAddress = (store: any) => {
    return `${store.address}${store.suite ? `, ${store.suite}` : ""}, ${
      store.city
    }, ${store.state} ${store.zipCode}`;
  };

  if (!reservation || !priceSummary || !organization || !organizationSettings) {
    console.error("Missing required data for email generation");
    return `<div>Uh oh, you messed up.</div>`;
  }

  try {
    const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reservation Details</title>
        <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #000000; }
        .email-container { width: 600px; margin: 0 auto; padding: 10px; }
        .header { margin-bottom: 20px; }
        .logo { width: 192px; height: auto; }
        .logo img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .section-header { font-size: 18px; font-weight: 600; margin-bottom: 10px; background-color: #f3f4f6; padding: 10px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
        .content-columns { display: flex; }
   
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f9fafb; font-weight: 600; }
        .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #000000; }
        .main-row { background-color: white !important; }
        .tax-row { background-color: #ffffff ! important; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Organization Header -->
          <div style="margin-bottom: 24px; text-align: center;">
            ${
              safeGet(organization, "logo_url")
                ? `
              <div style="width: 100%; margin-bottom: 16px; text-align: center;">
                <img
                  src="${safeGet(organization, "logo_url")}"
                  alt="${safeGet(organization, "name")}"
                  style="max-width: 100%; max-height: 100px; object-fit: contain; margin: 0 auto;"
                />
              </div>
            `
                : ""
            }
            <p style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">
              ${safeGet(organization, "name")}
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

          ${
            emailText
              ? `
          <!-- Message Box -->
          <div style="border: 1px solid #e5e7eb; border-radius: 4px; padding: 15px; margin-bottom: 20px; background-color: #ffffff;">
            <p style="white-space: pre-wrap; margin: 0;">${emailText}</p>
          </div>
          `
              : ""
          }

          <h1 style="font-size: 24px; color: #333; margin: 0 0 20px 0; text-align: center;">
            Reservation #${safeGet(
              reservation,
              "reservation_number"
            )} for ${safeGet(reservation, "first_name")} ${safeGet(
      reservation,
      "last_name"
    )}
          </h1>

          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${
              safeGet(reservation, "rvs.primary_image_url") || ""
            }" alt="${
      safeGet(reservation, "rvs.name") || "RV"
    }" style="max-width: 100%; height: auto; margin-bottom: 20px; border-radius: 8px;">
          </div>

          <div class="section-header">Rental Dates</div>
          <table style="margin-bottom: 20px;">
            <tr>
              <td>
                <strong>${
                  safeGet(reservation, "is_delivery") ? "Delivery" : "Departure"
                }</strong><br>
                ${formatUTCDateForDisplay(
                  safeGet(reservation, "check_in_date"),
                  organizationSettings.timezone,
                  "MMM d, yyyy h:mm a"
                )}<br>
                ${
                  safeGet(reservation, "is_delivery")
                    ? safeGet(
                        reservation,
                        "delivery_location.formatted_address"
                      )
                    : getStoreAddress(pickupStore)
                }
              </td>
              <td style="text-align: right;">
                <strong>${
                  safeGet(reservation, "is_delivery") ? "Pickup" : "Return"
                }</strong><br>
                ${formatUTCDateForDisplay(
                  safeGet(reservation, "check_out_date"),
                  organizationSettings.timezone,
                  "MMM d, yyyy h:mm a"
                )}<br>
                ${
                  safeGet(reservation, "is_delivery")
                    ? safeGet(
                        reservation,
                        "delivery_location.formatted_address"
                      )
                    : getStoreAddress(pickupStore)
                }
              </td>
            </tr>
          </table>

          <div class="section-header">Price Summary</div>
          <div class="overflow-auto max-h-[500px] w-full">
            ${generatePricingTable(priceSummary, organizationSettings)}
          </div>
          <div style="border-top: 1px solid #e5e7eb; margin-top: 1rem; padding-top: 1rem;">
            <table style="width: 100%; font-size: 1rem;">
              <tr>
                <td style="text-align: left; font-weight: bold; padding: 4px 0;">Subtotal:</td>
                <td style="text-align: right; padding: 4px 0; font-weight: bold;">$${formatMoney(
                  safeGet(priceSummary, "totalBeforeTax", 0)
                )}</td>
              </tr>
              ${combineTaxes(priceSummary?.taxRateCollection)
                .map(
                  (tax) => `
                <tr>
                  <td style="text-align: left; padding: 4px 0 4px 40px; font-size: 0.875rem; background-color: white !important;">${
                    tax.name
                  } (${tax.rate}%):</td>
                  <td style="text-align: right; padding: 4px 0; font-size: 0.875rem; background-color: white !important;">$${formatMoney(
                    tax.amount
                  )}</td>
                </tr>
              `
                )
                .join("")}
              <tr>
                <td style="text-align: left; font-weight: bold; padding: 4px 0; background-color: white !important">Total:</td>
                <td style="text-align: right; font-weight: bold; padding: 4px 0; background-color: white !important">$${formatMoney(
                  safeGet(priceSummary, "grandTotal", 0)
                )}</td>
              </tr>
              <tr>
                <td style="text-align: left; font-weight: bold; padding: 4px 0;">Paid:</td>
                <td style="text-align: right; padding: 4px 0;">$${formatMoney(
                  safeGet(priceSummary, "amountPaid", 0)
                )}</td>
              </tr>
              <tr>
                <td style="text-align: left; font-weight: bold; padding: 4px 0;">Balance Due:</td>
                <td style="text-align: right; padding: 4px 0;">$${formatMoney(
                  safeGet(priceSummary, "balanceDue", 0)
                )}</td>
              </tr>
              <tr>
                <td style="text-align: left; font-weight: bold; padding: 4px 0;">Security Deposit:</td>
                <td style="text-align: right; padding: 4px 0;">$${formatMoney(
                  safeGet(priceSummary, "securityDeposit", 0)
                )} (${safeGet(
      priceSummary,
      "securityDepositStatus",
      "N/A"
    )})</td>
              </tr>
            </table>
          </div>

          <div class="section-header">Transaction History</div>
          <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="text-align: left">Date</th>
                <th style="text-align: left">Description</th>
                <th style="text-align: left">Method</th>
                <th style="text-align: right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${
                transactions.length > 0
                  ? transactions
                      .filter((transaction: any) => {
                        const date = new Date(
                          safeGet(transaction, "created_at")
                        );
                        return !isNaN(date.getTime());
                      })
                      .map(
                        (transaction: any) => `
                <tr>
                  <td>${formatDate(safeGet(transaction, "created_at"))}</td>
                  <td>${safeGet(transaction, "description")}</td>
                  <td>${safeGet(transaction, "method")}</td>
                  <td style="text-align: right">$${formatMoney(
                    safeGet(transaction, "amount")
                  )}</td>
                </tr>
              `
                      )
                      .join("")
                  : `
                <tr>
                  <td colspan="4" style="text-align: center">No transactions available</td>
                </tr>
              `
              }
            </tbody>
          </table>

          <div class="section-header">Rental Unit Details</div>
          <div style="font-size: 14px; padding: 10px; margin-bottom: 20px;">
            <p><strong>Unit Name:</strong> ${safeGet(
              reservation,
              "rvs.name"
            )}</p>
            <p><strong>Unit ID:</strong> ${safeGet(
              reservation,
              "rvs.unit_number"
            )}</p>
            <p><strong>Year:</strong> ${safeGet(reservation, "rvs.year")}</p>
            <p><strong>Make:</strong> ${safeGet(reservation, "rvs.make")}</p>
            <p><strong>Model:</strong> ${safeGet(reservation, "rvs.model")}</p>
            <p><strong>Class:</strong> ${safeGet(reservation, "rvs.type")}</p>
            <p><strong>Length:</strong> ${safeGet(
              reservation,
              "rvs.length"
            )} ${safeGet(organizationSettings, "measurementUnits.length")}</p>
            <p><strong>Height:</strong> ${safeGet(
              reservation,
              "rvs.height"
            )} ${safeGet(organizationSettings, "measurementUnits.length")}</p>
            <p><strong>VIN:</strong> ${safeGet(reservation, "rvs.vin")}</p>
            <p><strong>License Plate:</strong> ${safeGet(
              reservation,
              "rvs.license_plate"
            )} (${safeGet(reservation, "rvs.state")})</p>
          </div>

          <!-- Footer -->
          <div class="footer">Email sent at: ${currentTime}</div>
        </div>
      </body>
      </html>
    `;

    console.log("Email content generated successfully");
    return emailContent;
  } catch (error) {
    console.error("Error generating email content:", error);
    return "Error: Failed to generate email content You messed up idiot.";
  }
};
