import SendEmailButton from "../../../Components/SendEmailButton";
import { generateCompletedReservationHtml } from "../../../EmailCollection/generateCompletedReservationHtml";

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
      { name: "City Tax", rate: 2, amount: 10, type: "SALES", source: "city" },
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

export default function page() {
  const emailContent = generateCompletedReservationHtml(testInput);
  return (
    <div>
      <h1>Completed Page</h1>
      <SendEmailButton />
      <div dangerouslySetInnerHTML={{ __html: emailContent }} />
    </div>
  );
}
