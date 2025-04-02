import SendEmailButton from "../../../Components/SendEmailButton";
import { generateEmailContent } from "../../../EmailCollection/generateEmailContent";

const sampleInput = {
  reservation: {
    reservation_number: "RV12345",
    first_name: "John",
    last_name: "Doe",
    store_uuid: "store-001",
    check_in_date: "2025-05-01T10:00:00Z",
    check_out_date: "2025-05-05T14:00:00Z",
    is_delivery: false,
    rvs: {
      name: "Explorer RV",
      unit_number: "RV-001",
      year: 2020,
      make: "Forest River",
      model: "Salem",
      type: "Class C",
      length: 32,
      height: 11,
      vin: "1HGBH41JXMN109186",
      license_plate: "ABC123",
      state: "CA",
      primary_image_url: "https://example.com/rv-image.jpg",
    },
  },
  priceSummary: {
    rentalFee: 1200.0,
    chargePeriods: 4,
    selectedUnit: {
      costPerPeriod: 300.0,
      name: "Explorer RV",
    },
    mileageFee: 50.0,
    manualMileageFee: false,
    appliedMileageRule: {
      tiers: [{ rate: 0.25 }],
    },
    billable_miles: 200,
    selectedAddons: [
      { name: "Camping Kit", quantity: 1, baseFee: 50.0, totalFee: 50.0 },
      {
        name: "Extra Insurance",
        quantity: 1,
        baseFee: 100.0,
        totalFee: 100.0,
      },
    ],
    totalBeforeTax: 1400.0,
    taxRateCollection: [
      {
        name: "Sales Tax",
        rate: 8.5,
        amount: 119.0,
        type: "SALES",
        source: "system",
      },
      {
        name: "Vehicle Tax",
        rate: 2.0,
        amount: 24.0,
        type: "RENTAL_VEHICLE",
        source: "system",
      },
    ],
    grandTotal: 1543.0,
    amountPaid: 500.0,
    balanceDue: 1043.0,
    securityDeposit: 300.0,
    securityDepositStatus: "Pending",
  },
  organization: {
    name: "Adventure Rentals",
    logo_url: "https://example.com/logo.png",
    phone_number: "123-456-7890",
    email: "contact@adventurerentals.com",
    website_url: "https://adventurerentals.com",
  },
  organizationSettings: {
    timezone: "America/Los_Angeles",
    measurementUnits: {
      length: "ft",
    },
  },
  transactions: [
    {
      created_at: "2025-04-01T12:00:00Z",
      description: "Initial Deposit",
      method: "Credit Card",
      amount: 500.0,
    },
  ],
  stores: [
    {
      id: "store-001",
      address: "123 Main St",
      suite: "Suite 4",
      city: "San Diego",
      state: "CA",
      zipCode: "92101",
    },
  ],
  emailText:
    "Thank you for choosing Adventure Rentals!\nPlease arrive 15 minutes early for check-in.",
};

export default function Page() {
  const emailContent = generateEmailContent(
    sampleInput.reservation,
    sampleInput.priceSummary,
    sampleInput.organization,
    sampleInput.organizationSettings,
    sampleInput.transactions,
    sampleInput.stores,
    sampleInput.emailText
  );
  console.log("Email size (bytes):", Buffer.byteLength(emailContent, "utf8"));
  console.log("Email content:", emailContent);
  return (
    <div>
      <h1>Test Email Sending</h1>
      <SendEmailButton />
      <div dangerouslySetInnerHTML={{ __html: emailContent }} />
    </div>
  );
}
