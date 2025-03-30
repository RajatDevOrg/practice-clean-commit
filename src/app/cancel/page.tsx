import { generateCancelEmailContent } from "../../../EmailCollection/generateCancelEmailContent";

const testInput = {
  customerName: "John Doe",
  reservationNumber: "RV12345",
  customMessage:
    "We're sorry to see you go. If you need assistance, please contact our support team.",
  organization: {
    logo_url: "https://example.com/logo.png",
    website_url: "https://example.com",
    phone_number: "+1-800-123-4567",
    email: "support@example.com",
    name: "RV Rentals Inc.",
  },
};

export default function CancelPage() {
  const emailContent = generateCancelEmailContent(testInput);
  return (
    <div>
      <h1>Cancellation Page</h1>
      <div dangerouslySetInnerHTML={{ __html: emailContent.htmlContent }} />
    </div>
  );
}
