import FormData from "form-data";
import Mailgun from "mailgun.js";
import { generateAbandonedCheckoutHtml } from "../EmailCollection/generateAbandonedCheckoutHtml";
import { generateCancelEmailContent } from "../EmailCollection/generateCancelEmailContent";
import { generateCompletedReservationHtml } from "../EmailCollection/generateCompletedReservationHtml";
import { generateStripeWebhookEmailContent } from "../EmailCollection/generateStripeWebhookEmailContent";

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

  // Generate the HTML content
  //const htmlContent = generateAbandonedCheckoutHtml(testParams1);

  //const { htmlContent, textContent } = generateCancelEmailContent(testParams2);

  //const htmlContent = generateCompletedReservationHtml(testInput);

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
