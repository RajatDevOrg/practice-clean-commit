// app/page.tsx (or wherever this file lives)

import SendEmailButton from "../../Components/SendEmailButton";
import { generateAbandonedCheckoutHtml } from "../../EmailCollection/generateAbandonedCheckoutHtml";
import { base64MainImg } from "../assets/imgs";

import { generateCancelEmailContent } from "../../EmailCollection/generateCancelEmailContent";

const testParams1: GenerateAbandonedCheckoutEmailParams = {
  customerName: "Rajat Kumar",
  customerFirstName: "Rajat",
  checkInDate: "2025-04-01T14:00:00Z",
  checkOutDate: "2025-04-05T11:00:00Z",
  rvName: "Adventure Camper",
  rvDetails: {
    primary_image_url: "https://via.placeholder.com/600x300.png?text=RV+Image", // Test image
  },
  resumeUrl: "https://example.com/resume-booking/123",
  organizationSettings: {
    timezone: "America/New_York",
  },
  organization: {
    logo_url: base64MainImg,
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

export default function Page() {
  const emailContent = generateAbandonedCheckoutHtml(testParams1);
  // const emailContent = generateCancelEmailContent(testInput);

  return (
    <div>
      <h1>Test Email Sending</h1>
      <SendEmailButton />
      <div dangerouslySetInnerHTML={{ __html: emailContent }} />
    </div>
  );
}
