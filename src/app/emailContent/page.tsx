import { generateEmailContent } from "../../../EmailCollection/generateEmailContent";

const testInput = {
  reservation: {
    reservation_number: "RES-2025-001",
    first_name: "John",
    last_name: "Doe",
    store_uuid: "store-123",
    check_in_date: "2025-04-01T14:00:00Z",
    check_out_date: "2025-04-05T11:00:00Z",
    is_delivery: false,
    rvs: {
      name: "Adventure Camper",
      primary_image_url:
        "https://via.placeholder.com/600x300.png?text=RV+Image",
      unit_number: "RV-001",
      year: 2020,
      make: "Forest River",
      model: "Cherokee",
      type: "Class C",
      length: 32,
      height: 11,
      vin: "1HGCM82633A004352",
      license_plate: "ABC123",
      state: "CA",
    },
  },
  priceSummary: {
    rentalFee: 500,
    chargePeriods: 4,
    selectedUnit: {
      costPerPeriod: 125,
    },
    mileageFee: 50,
    billable_miles: 100,
    appliedMileageRule: {
      tiers: [{ rate: 0.5 }],
    },
    selectedAddons: [
      {
        name: "Camping Gear Kit",
        quantity: 2,
        baseFee: 25,
        totalFee: 50,
      },
    ],
    totalBeforeTax: 600,
    taxRateCollection: [
      {
        name: "State Tax",
        rate: 6,
        amount: 36,
        type: "SALES",
      },
    ],
    grandTotal: 636,
    amountPaid: 200,
    balanceDue: 436,
    securityDeposit: 300,
    securityDepositStatus: "Pending",
  },
  organization: {
    logo_url:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/olM7QAAAAAASUVORK5CYII=",
    name: "RV Rentals Inc",
    phone_number: "+1-555-123-4567",
    email: "bookings@rvrentals.com",
    website_url: "https://rvrentals.com",
  },
  organizationSettings: {
    timezone: "America/New_York",
    measurementUnits: {
      length: "ft",
    },
  },
  transactions: [
    {
      created_at: "2025-03-30T10:00:00Z",
      description: "Initial Deposit",
      method: "Credit Card",
      amount: 200,
    },
  ],
  stores: [
    {
      id: "store-123",
      address: "123 Main St",
      suite: "Suite 4",
      city: "Anytown",
      state: "NY",
      zipCode: "12345",
    },
  ],
  emailText:
    "Thank you for booking with us!\nPlease arrive 15 minutes early.\nContact us with any questions.",
};

export default function Page() {
  const emailContent = generateEmailContent(
    testInput.reservation,
    testInput.priceSummary,
    testInput.organization,
    testInput.organizationSettings,
    testInput.transactions,
    testInput.stores,
    testInput.emailText
  );
  console.log("Email size (bytes):", Buffer.byteLength(emailContent, "utf8"));
  console.log("Email content:", emailContent);
  return (
    <div>
      <h1>Test Email Sending</h1>
      {/* <SendEmailButton /> */}
      <div dangerouslySetInnerHTML={{ __html: emailContent }} />
    </div>
  );
}
