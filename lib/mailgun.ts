import FormData from "form-data";
import Mailgun from "mailgun.js";
import { generateAbandonedCheckoutHtml } from "../EmailCollection/generateAbandonedCheckoutHtml";
import { generateCancelEmailContent } from "../EmailCollection/generateCancelEmailContent";
import { generateCompletedReservationHtml } from "../EmailCollection/generateCompletedReservationHtml";
import { generateQuoteHtml } from "../EmailCollection/generateQuoteHtml";

async function sendSimpleMessage() {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.API_KEY || "API_KEY", // Use env variable or hardcode for testing
    // url: "https://api.eu.mailgun.net" // Uncomment if using EU domain
  });

  // Sample test data
  const testParams1: GenerateAbandonedCheckoutEmailParams = {
    customerName: "Rajat Kumar",
    customerFirstName: "Rajat",
    checkInDate: "2025-04-01T14:00:00Z",
    checkOutDate: "2025-04-05T11:00:00Z",
    rvName: "Adventure Camper",
    rvDetails: {
      primary_image_url:
        "https://via.placeholder.com/600x300.png?text=RV+Image", // Test image
    },
    resumeUrl: "https://example.com/resume-booking/123",
    organizationSettings: {
      timezone: "America/New_York",
    },
    organization: {
      logo_url: "https://via.placeholder.com/200x50.png?text=Logo",
      name: "RV Rentals Inc",
      phone_number: "+1-555-123-4567",
      email: "bookings@rvrentals.com",
      website_url: "https://rvrentals.com",
      mailgun_email: "bookings@rvrentals.com",
    },
    isSecondReminder: false, // Test both true and false
    priceSummary: {
      rentalFee: 500,
      chargePeriods: 4,
      selectedUnit: {
        name: "Adventure Camper",
        costPerPeriod: 125,
      },
      totalBeforeTax: 500,
      taxRateCollection: [
        {
          name: "State Tax",
          rate: 6,
          amount: 30,
          type: "SALES",
        },
      ],
      grandTotal: 530,
      reservationDeposit: 150,
    },
  };

  const testParams2: CancelEmailContentProps = {
    customerName: "Rajat Kumar",
    reservationNumber: "RV123456",
    isSecondReminder: false,
    customMessage:
      "We regret to inform you that your reservation has been cancelled due to unforeseen circumstances. Please contact us if you’d like to rebook or discuss refund options.",
    organization: {
      logo_url: "https://via.placeholder.com/200x50.png?text=RV+Rentals+Logo",
      website_url: "https://rvrentals.com/",
      phone_number: "+1-555-123-4567",
      email: "support@rvrentals.com",
      name: "RV Rentals Inc",
    },
  };

  const testInput = {
    rvDetails: {
      name: "Luxury RV",
      type: "Class A",
    },
    dates: {
      checkIn: "2025-04-10T12:00:00Z",
      checkOut: "2025-04-15T12:00:00Z",
    },
    priceSummary: {
      rentalFee: 500,
      chargePeriods: 5,
      selectedUnit: {
        name: "Luxury RV",
        costPerPeriod: 100,
      },
      mileageFee: 50,
      manualMileageFee: false,
      billable_miles: 200,
      appliedMileageRule: {
        tiers: [{ rate: 0.25 }],
      },
      generatorFee: 30,
      departureGeneratorHours: 10,
      returnGeneratorHours: 20,
      appliedGeneratorRule: true,
      selectedAddons: [
        {
          name: "Bike Rack",
          quantity: 1,
          baseFee: 15,
          totalFee: 15,
        },
      ],
      taxRateCollection: [
        {
          name: "State Tax",
          rate: 5,
          amount: 25,
          type: "SALES",
          source: "state",
        },
        {
          name: "City Tax",
          rate: 2,
          amount: 10,
          type: "SALES",
          source: "city",
        },
      ],
      totalBeforeTax: 595,
      grandTotal: 630,
    },
    emailText: "Thank you for booking with us!",
    organizationSettings: {
      currency: "USD",
    },
    organization: {
      name: "Luxury RV Rentals",
      website: "https://luxuryrvrentals.com",
      email: "support@luxuryrvrentals.com",
      phone: "+1-800-555-1234",
    },
  };

  const testInput4: GenerateQuoteHtmlParams = {
    rvDetails: {
      name: "Adventure Camper",
      primary_image_url:
        "https://via.placeholder.com/600x300.png?text=RV+Image",
    },
    customerFirstName: "John",
    customerLastName: "Doe",
    dates: {
      checkIn: "2025-04-01T14:00:00Z",
      checkOut: "2025-04-05T11:00:00Z",
    },
    priceSummary: {
      rentalFee: 500,
      chargePeriods: 4,
      selectedUnit: {
        name: "Adventure Camper",
        costPerPeriod: 125,
      },
      mileageFee: 50,
      billable_miles: 100,
      appliedMileageRule: {
        tiers: [{ rate: 0.5 }],
      },
      generatorFee: 30,
      departureGeneratorHours: 10,
      returnGeneratorHours: 16,
      appliedGeneratorRule: true,
      selectedAddons: [
        {
          name: "Camping Gear Kit",
          quantity: 2,
          baseFee: 25,
          totalFee: 50,
        },
      ],
      totalBeforeTax: 630,
      taxRateCollection: [
        {
          name: "State Tax",
          rate: 6,
          amount: 37.8,
          type: "SALES",
        },
      ],
      grandTotal: 667.8,
      reservationDeposit: 200,
    },
    emailText:
      "Thank you for your interest!\nThis quote is valid for 7 days.\nContact us if you have any questions.",
    checkoutUrl: "https://example.com/checkout/reservation/12345",
    reservationId: "12345",
    organizationSettings: {
      timezone: "America/New_York",
    },
    organization: {
      logo_url:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/olM7QAAAAAASUVORK5CYII=",
      name: "RV Rentals Inc",
      phone_number: "+1-555-123-4567",
      email: "quotes@rvrentals.com",
      website_url: "https://rvrentals.com",
    },
  };

  // Generate the HTML content
  //const htmlContent = generateAbandonedCheckoutHtml(testParams1);

  //const { htmlContent, textContent } = generateCancelEmailContent(testParams2);

  //const htmlContent = generateCompletedReservationHtml(testInput);

  const htmlContent = generateQuoteHtml(testInput4);

  try {
    const data = await mg.messages.create(
      "sandbox81a3c45ce00b4fbea83ab3d85d6a99cd.mailgun.org", // Your sandbox domain
      {
        from: "RV Rentals Inc <postmaster@sandbox81a3c45ce00b4fbea83ab3d85d6a99cd.mailgun.org>",
        to: ["Rajat Kumar <rajat812678@gmail.com>"],
        subject: testParams2.isSecondReminder
          ? "Last Chance: Complete Your RV Rental"
          : "Your Reservation with RV Rentals Inc",
        html: htmlContent,
        text: "Please view this email in an HTML-capable email client to complete your RV reservation.", // Fallback text
      }
    );

    console.log("Email sent successfully:", data);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export default sendSimpleMessage;
