import SendEmailButton from "../../../Components/SendEmailButton";
import { generateQuoteHtml } from "../../../EmailCollection/generateQuoteHtml";

const testInput: GenerateQuoteHtmlParams = {
  rvDetails: {
    name: "Adventure Camper",
    primary_image_url: "https://via.placeholder.com/600x300.png?text=RV+Image",
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

export default function Page() {
  const emailContent = generateQuoteHtml(testInput);

  return (
    <div>
      <h1>Test Quote Email</h1>
      <SendEmailButton></SendEmailButton>
      <div dangerouslySetInnerHTML={{ __html: emailContent }} />
    </div>
  );
}
