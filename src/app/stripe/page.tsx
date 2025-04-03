import SendEmailButton from "../../../Components/SendEmailButton";

import { generateStripeWebhookEmailContent } from "../../../EmailCollection/generateStripeWebhookEmailContent";

const sampleReservation = {
  first_name: "John",
  last_name: "Doe",
  reservation_number: "RES123456",
  primary_driver_name: "John Doe",
  secondary_drivers: [
    { firstName: "Jane", lastName: "Smith" },
    { firstName: "Mike", lastName: "Johnson" },
  ],
  rvs: {
    name: "Forest River RV",
    year: 2022,
    make: "Forest River",
    model: "Wildwood",
    type: "Class C",
    length: 32,
    height: 11,
    vin: "1FDXE4FS8KDC12345",
    license_plate: "ABC123",
    state: "CA",
  },
  check_in_date: "2025-05-01T14:00:00Z",
  check_out_date: "2025-05-05T12:00:00Z",
  delivery_location: {
    formatted_address: "123 Main St, Springfield, IL 62701, USA",
  },
};

const samplePriceSummary = {
  securityDeposit: 500,
  mileageFee: 50,
  distance: 100,
  nightlyRate: 150,
  rentalFee: 600,
  nights: 4,
  selectedAddons: [
    { name: "Camping Gear", quantity: 1, price: 50 },
    { name: "Extra Insurance", quantity: 1, price: 75 },
  ],
  subtotal: 725,
  taxAmount: 58,
  discount: 20,
  grandTotal: 763,
  amountPaid: 300,
  balanceDue: 463,
};

const sampleOrganization = {
  logo_url: "https://example.com/logo.png",
  website_url: "https://example.com/",
  phone_number: "1-800-555-1234",
  email: "support@example.com",
  name: "Adventure Rentals",
};

const sampleStoreData = {
  address: "456 Elm St",
  suite: "Suite 100",
  city: "Springfield",
  state: "IL",
  zip_code: "62701",
  contactName: "Sarah Miller",
  contactPhone: "217-555-6789",
};

const sampleOrganizationSettings = {
  timezone: "America/Chicago",
  measurementUnits: {
    length: "ft",
    distance: "miles",
  },
};

const sampleTransactions = [
  {
    created_at: "2025-04-01T10:00:00Z",
    description: "Initial Deposit",
    method: "Credit Card",
    amount: 300,
  },
];

const samplePrimaryDriverVerification = {
  verificationData: {
    master_verified: true,
  },
};

const sampleAdditionalDriverVerifications = [
  {
    verificationData: {
      master_verified: true,
    },
  },
  {
    verificationData: {
      master_verified: false,
    },
  },
];

// Test the function
const isRequestOnly = false; // Set to true to test request-only mode

export default function Page() {
  const htmlContent = generateStripeWebhookEmailContent(
    sampleReservation,
    samplePriceSummary,
    sampleOrganization,
    sampleStoreData,
    sampleOrganizationSettings,
    isRequestOnly,
    sampleTransactions,
    samplePrimaryDriverVerification,
    sampleAdditionalDriverVerifications
  );

  return (
    <div>
      <h1>Test Email Sending</h1>
      <SendEmailButton />
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
