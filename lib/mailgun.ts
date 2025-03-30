import FormData from "form-data";
import Mailgun from "mailgun.js";
import { generateAbandonedCheckoutHtml } from "../EmailCollection/generateAbandonedCheckoutHtml";
import { generateCancelEmailContent } from "../EmailCollection/generateCancelEmailContent";

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

  // Generate the HTML content
  const htmlContent = generateAbandonedCheckoutHtml(testParams1);

  //const { htmlContent, textContent } = generateCancelEmailContent(testParams2);

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
