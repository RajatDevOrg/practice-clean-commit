import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { dates } from '~/lib/utils/dates';
import { formatMoney, safeGet } from '~/lib/utils/formatters';

export const generateStripeWebhookEmailContent = (
  reservation: any,
  priceSummary: any,
  organization: any,
  storeData: any,
  organizationSettings: any,
  isRequestOnly: boolean = false,
  transactions: any[] = [],
  primaryDriverVerification: any = null,
  additionalDriverVerifications: any[] = [],
): string => {
  // Format the store address in a more explicit way
  let pickupAddress = 'Address not available';
  if (storeData) {
    const street = `${storeData.address || ''}${
      storeData.suite ? `, ${storeData.suite}` : ''
    }`;
    const cityStateZip = `${storeData.city || ''}, ${storeData.state || ''} ${
      storeData.zip_code || ''
    }`;
    pickupAddress = `${street}\n${cityStateZip}`;
  }

  const storeAddress = pickupAddress;

  const formatUTCDateForDisplayDays = (
    utcDateString: string | undefined,
    timezone: string,
  ) => {
    if (!utcDateString) return 'Not set';
    const date = parseISO(utcDateString);
    return formatInTimeZone(date, timezone, 'MMM dd, yyyy');
  };

  const formatUTCDateForDisplayTime = (
    utcDateString: string | undefined,
    timezone: string,
  ) => {
    if (!utcDateString) return 'Not set';
    const date = parseISO(utcDateString);
    return formatInTimeZone(date, timezone, 'HH:mm zzz');
  };

  const formatUTCDateForDisplay = (
    utcDateString: string | undefined,
    timezone: string,
    formatString: string,
  ) => {
    if (!utcDateString) return 'Not set';
    const date = parseISO(utcDateString);
    return formatInTimeZone(date, timezone, formatString);
  };

  const getGoogleMapsLink = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address,
    )}`;
  };

  // Function to format address as two lines without comma at end of first line and without ", USA"
  const getFormattedAddress = (location: any) => {
    let address = 'Address unavailable';

    // If location is already an object, use it directly
    if (
      location &&
      typeof location === 'object' &&
      location.formatted_address
    ) {
      address = location.formatted_address;
    }
    // If location is a string, try to parse it
    else if (typeof location === 'string') {
      try {
        const parsedLocation = JSON.parse(location);
        address = parsedLocation.formatted_address || 'Address unavailable';
      } catch (error) {
        console.error('Error parsing location:', error);
        return 'Address unavailable';
      }
    }

    if (address !== 'Address unavailable') {
      // Remove ", USA" from the end
      let formattedAddress = address.replace(/, USA$/, '');

      // Try to extract the state and zip code
      const stateZipRegex = /,\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/;
      const stateZipMatch = formattedAddress.match(stateZipRegex);

      if (stateZipMatch) {
        // Get the state and zip code (e.g., "CA 90210")
        const stateZip = stateZipMatch[0].substring(2).trim(); // Remove the comma and space

        // Get the rest of the address without the state and zip
        const addressWithoutStateZip = formattedAddress.substring(
          0,
          formattedAddress.length - stateZipMatch[0].length,
        );

        // Find the last comma in the remaining address (to separate street from city)
        const lastCommaIndex = addressWithoutStateZip.lastIndexOf(',');

        if (lastCommaIndex !== -1) {
          // Extract street and city
          const street = addressWithoutStateZip
            .substring(0, lastCommaIndex)
            .trim();
          const city = addressWithoutStateZip
            .substring(lastCommaIndex + 1)
            .trim();

          // Format as "Street, City" on first line and "State ZIP" on second line
          return `${street}, ${city}\n${stateZip}`;
        }
      }

      // If we couldn't parse it properly, just return the original address
      return formattedAddress;
    }

    return address;
  };

  const confirmationMessage = isRequestOnly
    ? 'Your reservation request has been submitted for review. You will be notified when the request is approved!'
    : 'Your reservation is confirmed!';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reservation ${isRequestOnly ? 'Request' : 'Confirmation'}</title>
      <style>
        body { font-family: Cereal, 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #222222; background-color: #f7f7f7; }
        .container { width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { padding: 24px 48px; }
        .content { padding: 0; }
        .divider { border-top: 1px solid #dddddd; margin: 24px 0; }
        .footer { text-align: center; font-size: 14px; color: #767676; padding: 24px; }
        h1 { font-size: 32px; line-height: 36px; color: #222222; font-weight: bold; margin: 0; }
        h2 { font-size: 22px; line-height: 26px; color: #222222; font-weight: bold; margin: 0; }
        h3 { font-size: 18px; line-height: 22px; color: #222222; font-weight: bold; margin: 0; }
        .heading4 { font-size: 16px; line-height: 20px; color: #222222; font-weight: 800; margin: 0; }
        p { font-size: 16px; line-height: 24px; color: #222222; margin: 0; }
        a { color: #008489; text-decoration: none; font-size: 16px; line-height: 24px; }
        .short-divider { width: 32px; border-top: 4px solid #222222; margin: 32px 0; }
        .section-header { background-color: #f3f4f6; padding: 8px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; font-weight: 600; margin-bottom: 8px; }
        .grid-row { display: table-row; }
        .grid-cell-label { display: table-cell; width: 100px; padding: 2px 0; }
        .grid-cell-value { display: table-cell; padding: 2px 0; }
        .bg-gray-200 { background-color: #e5e7eb; }
        .p-2 { padding: 8px; }
        .mb-6 { margin-bottom: 24px; }
        .flex { display: table; width: 100%; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .font-bold { font-weight: bold; }
      </style>
    </head>
    <body>
      <table class="container" cellpadding="0" cellspacing="0" border="0" align="center" width="100%">
        <tr>
          <td>
            <!-- Organization Header -->
            <table class="header" cellpadding="0" cellspacing="0" border="0" align="center" width="100%" style="margin-bottom: 24px;">
              <tr>
                <td width="50%" style="vertical-align: top;">
                  ${
                    organization && organization.logo_url
                      ? `<div style="width: 100%; height: 100px; display: table-cell; vertical-align: middle;">
                          <img src="${organization.logo_url}" alt="${organization.name}" style="max-width: 100%; max-height: 100%; object-fit: contain; width: auto; height: auto;">
                        </div>`
                      : ''
                  }
                </td>
                <td width="50%" style="vertical-align: top; text-align: right;">
                  <p style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">${
                    organization.name
                  }</p>
                  <p>${organization.phone_number || ''}</p>
                  <p>${organization.email || ''}</p>
                  <p>${
                    organization.website_url
                      ? organization.website_url.replace(/\/$/, '')
                      : ''
                  }</p>
                </td>
              </tr>
            </table>
            
            <!-- Customer and Reservation Number Bar -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" class="bg-gray-200 p-2 mb-6" style="background-color: #e5e7eb; padding: 8px; margin-bottom: 24px;">
              <tr>
                <td width="50%" style="font-weight: bold;">
                  ${reservation.first_name} ${reservation.last_name}
                </td>
                <td width="50%" style="text-align: right;">
                  <span>Reservation #${safeGet(
                    reservation,
                    'reservation_number',
                  )}</span>
                </td>
              </tr>
            </table>
            
            <!-- Main Content Two Column Layout -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" class="content">
              <tr>
                <!-- Left Column -->
                <td width="40%" style="vertical-align: top; padding-right: 16px; border-right: 1px solid #e5e7eb;">
                  
                  <!-- Rental Unit -->
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                    <tr>
                      <td class="section-header" style="background-color: #f3f4f6; padding: 8px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; font-weight: 600; margin-bottom: 8px;">
                        ${safeGet(reservation, 'rvs.name')}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; font-size: 14px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td class="grid-cell-label" style="width: 100px; padding: 2px 0;">Year:</td>
                            <td class="grid-cell-value" style="padding: 2px 0;">${safeGet(
                              reservation,
                              'rvs.year',
                            )}</td>
                          </tr>
                          <tr>
                            <td class="grid-cell-label" style="width: 100px; padding: 2px 0;">Make:</td>
                            <td class="grid-cell-value" style="padding: 2px 0;">${safeGet(
                              reservation,
                              'rvs.make',
                            )}</td>
                          </tr>
                          <tr>
                            <td class="grid-cell-label" style="width: 100px; padding: 2px 0;">Model:</td>
                            <td class="grid-cell-value" style="padding: 2px 0;">${safeGet(
                              reservation,
                              'rvs.model',
                            )}</td>
                          </tr>
                          <tr>
                            <td class="grid-cell-label" style="width: 100px; padding: 2px 0;">Class:</td>
                            <td class="grid-cell-value" style="padding: 2px 0;">${safeGet(
                              reservation,
                              'rvs.type',
                            )}</td>
                          </tr>
                          <tr>
                            <td class="grid-cell-label" style="width: 100px; padding: 2px 0;">Length:</td>
                            <td class="grid-cell-value" style="padding: 2px 0;">${safeGet(
                              reservation,
                              'rvs.length',
                            )} ${
                              organizationSettings.measurementUnits?.length ||
                              ''
                            }</td>
                          </tr>
                          <tr>
                            <td class="grid-cell-label" style="width: 100px; padding: 2px 0;">Height:</td>
                            <td class="grid-cell-value" style="padding: 2px 0;">${safeGet(
                              reservation,
                              'rvs.height',
                            )} ${
                              organizationSettings.measurementUnits?.length ||
                              ''
                            }</td>
                          </tr>
                          <tr>
                            <td class="grid-cell-label" style="width: 100px; padding: 2px 0;">VIN:</td>
                            <td class="grid-cell-value" style="padding: 2px 0;">${safeGet(
                              reservation,
                              'rvs.vin',
                            )}</td>
                          </tr>
                          <tr>
                            <td class="grid-cell-label" style="width: 100px; padding: 2px 0;">License:</td>
                            <td class="grid-cell-value" style="padding: 2px 0;">${safeGet(
                              reservation,
                              'rvs.license_plate',
                            )} ${safeGet(reservation, 'rvs.state')}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Customer Information -->
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                    <tr>
                      <td class="section-header" style="background-color: #f3f4f6; padding: 8px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; font-weight: 600; margin-bottom: 8px;">
                        Customer Information
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; font-size: 14px;">
                        <p style="font-weight: 600; margin-bottom: 4px;">Primary Driver:</p>
                        <p style="margin-bottom: 12px;">
                          ${
                            reservation.primary_driver_name ||
                            `${reservation.first_name} ${reservation.last_name}`
                          }&nbsp;&nbsp;—&nbsp;&nbsp;
                          ${
                            primaryDriverVerification?.verificationData
                              ?.master_verified
                              ? 'Verified'
                              : 'Not Verified'
                          }
                        </p>
                        
                        ${
                          reservation.secondary_drivers &&
                          reservation.secondary_drivers.length > 0
                            ? `<p style="font-weight: 600; margin-bottom: 4px; margin-top: 8px;">Secondary Drivers:</p>
                             ${reservation.secondary_drivers
                               .map((driver: any, index: number) => {
                                 const driverVerification =
                                   additionalDriverVerifications?.[index];
                                 return `<p>${driver.firstName} ${
                                   driver.lastName
                                 } — ${
                                   driverVerification?.verificationData
                                     ?.master_verified
                                     ? 'Verified'
                                     : 'Not Verified'
                                 }</p>`;
                               })
                               .join('')}`
                            : ''
                        }
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Important Information -->
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                    <tr>
                      <td class="section-header" style="background-color: #f3f4f6; padding: 8px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; font-weight: 600; margin-bottom: 8px;">
                        Important Information
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; font-size: 14px;">
                        <p>Security Deposit: $${formatMoney(
                          priceSummary?.securityDeposit || 0,
                        )}</p>
                        ${
                          priceSummary?.mileageFee > 0
                            ? `<p>Mileage Policy: $${(
                                priceSummary.mileageFee /
                                (priceSummary.distance || 1)
                              ).toFixed(2)} ${
                                organizationSettings.measurementUnits
                                  ?.distance === 'km'
                                  ? 'per kilometer'
                                  : 'per mile'
                              }</p>`
                            : ''
                        }
                        <p>Insurance Policy: [Insert insurance policy]</p>
                        <p>Cancellation Policy: [Insert cancellation policy]</p>
                      </td>
                    </tr>
                  </table>
                </td>
                
                <!-- Right Column -->
                <td width="60%" style="vertical-align: top; padding-left: 16px;">
                  
                  <!-- Delivery/Pickup or Departure/Return -->
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                    <tr>
                      <td width="50%" style="vertical-align: top; padding-right: 8px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td class="section-header" style="background-color: #f3f4f6; padding: 8px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; font-weight: 600; margin-bottom: 8px;">
                              ${
                                !!reservation.delivery_location
                                  ? 'Delivery'
                                  : 'Departure'
                              }
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px; font-size: 14px;">
                              <p>${formatUTCDateForDisplay(
                                safeGet(reservation, 'check_in_date'),
                                organizationSettings.timezone,
                                'EEEE, MMMM d',
                              )}</p>
                              ${
                                !!reservation.delivery_location
                                  ? getFormattedAddress(
                                      reservation.delivery_location,
                                    )
                                      .split('\n')
                                      .map((line, index) => `<p>${line}</p>`)
                                      .join('')
                                  : storeAddress
                                      .split('\n')
                                      .map((line, index) => `<p>${line}</p>`)
                                      .join('')
                              }
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td width="50%" style="vertical-align: top; padding-left: 8px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td class="section-header" style="background-color: #f3f4f6; padding: 8px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; font-weight: 600; margin-bottom: 8px;">
                              ${
                                !!reservation.delivery_location
                                  ? 'Pickup'
                                  : 'Return'
                              }
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px; font-size: 14px;">
                              <p>${formatUTCDateForDisplay(
                                safeGet(reservation, 'check_out_date'),
                                organizationSettings.timezone,
                                'EEEE, MMMM d',
                              )}</p>
                              ${
                                !!reservation.delivery_location
                                  ? getFormattedAddress(
                                      reservation.delivery_location,
                                    )
                                      .split('\n')
                                      .map((line, index) => `<p>${line}</p>`)
                                      .join('')
                                  : storeAddress
                                      .split('\n')
                                      .map((line, index) => `<p>${line}</p>`)
                                      .join('')
                              }
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Price Information -->
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                    <tr>
                      <td class="section-header" style="background-color: #f3f4f6; padding: 8px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; font-weight: 600; margin-bottom: 8px;">
                        Price Summary
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; font-size: 14px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                          <thead>
                            <tr style="background-color: #ffffff;">
                              <th style="padding: 8px 4px; text-align: left; font-size: 14px; font-weight: bold; color: #6b7280; text-transform: uppercase; width: 50%;">Description</th>
                              <th style="padding: 8px 4px; text-align: right; font-size: 14px; font-weight: bold; color: #6b7280; text-transform: uppercase; width: 16%;">Qty</th>
                              <th style="padding: 8px 4px; text-align: right; font-size: 14px; font-weight: bold; color: #6b7280; text-transform: uppercase; width: 16%;">Amount</th>
                              <th style="padding: 8px 4px; text-align: right; font-size: 14px; font-weight: bold; color: #6b7280; text-transform: uppercase; width: 16%;">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <!-- Rental Fees -->
                            <tr>
                              <td style="padding: 4px; text-align: left;">Rental Fee</td>
                              <td style="padding: 4px; text-align: right;">${
                                priceSummary?.nights || 1
                              }</td>
                              <td style="padding: 4px; text-align: right;">$${formatMoney(
                                priceSummary?.nightlyRate || 0,
                              )}</td>
                              <td style="padding: 4px; text-align: right;">$${formatMoney(
                                priceSummary?.rentalFee || 0,
                              )}</td>
                            </tr>
                            
                            <!-- Mileage Fees if applicable -->
                            ${
                              priceSummary?.mileageFee > 0
                                ? `<tr>
                                  <td style="padding: 4px; text-align: left;">Mileage Fee</td>
                                  <td style="padding: 4px; text-align: right;">${
                                    priceSummary?.distance || 0
                                  } ${
                                    organizationSettings.measurementUnits
                                      ?.distance || 'miles'
                                  }</td>
                                  <td style="padding: 4px; text-align: right;">$${(
                                    priceSummary.mileageFee /
                                    (priceSummary.distance || 1)
                                  ).toFixed(2)}</td>
                                  <td style="padding: 4px; text-align: right;">$${formatMoney(
                                    priceSummary?.mileageFee || 0,
                                  )}</td>
                                </tr>`
                                : ''
                            }
                            
                            <!-- Addons -->
                            ${(priceSummary.selectedAddons || [])
                              .map(
                                (addon: any) => `
                              <tr>
                                <td style="padding: 4px; text-align: left;">${
                                  addon.name
                                }</td>
                                <td style="padding: 4px; text-align: right;">${
                                  addon.quantity || 1
                                }</td>
                                <td style="padding: 4px; text-align: right;">$${formatMoney(
                                  addon.price || 0,
                                )}</td>
                                <td style="padding: 4px; text-align: right;">$${formatMoney(
                                  (addon.price || 0) * (addon.quantity || 1),
                                )}</td>
                              </tr>
                            `,
                              )
                              .join('')}
                          </tbody>
                        </table>
                        
                        <!-- Totals -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td style="padding: 4px; text-align: right; font-weight: bold; width: 80%;">Subtotal:</td>
                            <td style="padding: 4px; text-align: right; width: 20%;">$${formatMoney(
                              priceSummary?.subtotal || 0,
                            )}</td>
                          </tr>
                          ${
                            priceSummary?.taxAmount > 0
                              ? `<tr>
                                <td style="padding: 4px; text-align: right; font-weight: bold; width: 80%;">Tax:</td>
                                <td style="padding: 4px; text-align: right; width: 20%;">$${formatMoney(
                                  priceSummary?.taxAmount || 0,
                                )}</td>
                              </tr>`
                              : ''
                          }
                          ${
                            priceSummary?.discount > 0
                              ? `<tr>
                                <td style="padding: 4px; text-align: right; font-weight: bold; width: 80%;">Discount:</td>
                                <td style="padding: 4px; text-align: right; width: 20%;">-$${formatMoney(
                                  priceSummary?.discount || 0,
                                )}</td>
                              </tr>`
                              : ''
                          }
                          <tr>
                            <td style="padding: 4px; text-align: right; font-weight: bold; width: 80%; border-top: 2px solid #e5e7eb;">Total:</td>
                            <td style="padding: 4px; text-align: right; width: 20%; border-top: 2px solid #e5e7eb;">$${formatMoney(
                              priceSummary?.grandTotal || 0,
                            )}</td>
                          </tr>
                          <tr>
                            <td style="padding: 4px; text-align: right; font-weight: bold; width: 80%;">Amount Paid:</td>
                            <td style="padding: 4px; text-align: right; width: 20%;">$${formatMoney(
                              priceSummary?.amountPaid || 0,
                            )}</td>
                          </tr>
                          <tr>
                            <td style="padding: 4px; text-align: right; font-weight: bold; width: 80%;">Balance Due:</td>
                            <td style="padding: 4px; text-align: right; width: 20%;">$${formatMoney(
                              priceSummary?.balanceDue || 0,
                            )}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Transaction History -->
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                    <tr>
                      <td class="section-header" style="background-color: #f3f4f6; padding: 8px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; font-weight: 600; margin-bottom: 8px;">
                        Transaction History
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; font-size: 14px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <thead>
                            <tr>
                              <th style="text-align: left; padding: 4px;">Date</th>
                              <th style="text-align: left; padding: 4px;">Description</th>
                              <th style="text-align: left; padding: 4px;">Method</th>
                              <th style="text-align: right; padding: 4px;">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${
                              transactions && transactions.length > 0
                                ? transactions
                                    .filter((transaction) => {
                                      const date = new Date(
                                        transaction.created_at,
                                      );
                                      return !isNaN(date.getTime());
                                    })
                                    .map(
                                      (transaction, index) => `
                                    <tr>
                                      <td style="padding: 4px;">${dates.formatDisplay(
                                        transaction.created_at,
                                      )}</td>
                                      <td style="padding: 4px;">${
                                        transaction.description
                                      }</td>
                                      <td style="padding: 4px;">${
                                        transaction.method
                                      }</td>
                                      <td style="padding: 4px; text-align: right;">$${
                                        transaction.amount
                                          ? transaction.amount.toFixed(2)
                                          : 'N/A'
                                      }</td>
                                    </tr>
                                  `,
                                    )
                                    .join('')
                                : `<tr>
                                  <td colspan="4" style="text-align: center; padding: 8px;">No transactions available</td>
                                </tr>`
                            }
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            
            <!-- Contact Information -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 24px;">
              <tr>
                <td>
                  <h2 style="margin-bottom: 8px;">Contact</h2>
                  <p>Contact ${
                    storeData.contactName || ''
                  } to coordinate arrival time and key exchange</p>
                  <p style="margin-top: 8px;">
                    <a href="mailto:${organization.email}">Message host</a>
                    ${
                      storeData.contactPhone
                        ? ` · ${storeData.contactPhone}`
                        : ''
                    }
                  </p>
                </td>
              </tr>
            </table>
            
            <!-- Footer -->
            <table class="footer" cellpadding="0" cellspacing="0" border="0" align="center" width="100%">
              <tr>
                <td>
                  <p>Thank you for choosing ${safeGet(
                    organization,
                    'name',
                  )}. We look forward to serving you!</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
