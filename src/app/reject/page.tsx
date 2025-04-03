import SendEmailButton from "../../../Components/SendEmailButton";
import { generateRejectEmailContent } from "../../../EmailCollection/generateRejectEmailContent";

const sampleInput = {
  customerName: "John Doe",
  reservationNumber: "123456789",
  customMessage:
    "We're sorry, but we are unable to approve your rental request at this time.",
  organization: {
    logo_url: "https://example.com/logo.png",
    website_url: "https://example.com",
    phone_number: "+1 234-567-8900",
    email: "support@example.com",
    name: "Example Rentals",
  },
};

export default function Page() {
  const { htmlContent, textContent } = generateRejectEmailContent(sampleInput);

  return (
    <div>
      <h1>Test Email Sending</h1>
      <SendEmailButton />
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
