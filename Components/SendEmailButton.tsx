"use client"; // Marks this as a Client Component

import { useState } from "react";

export default function SendEmailButton() {
  const [message, setMessage] = useState("");

  const sendEmail = async () => {
    try {
      const res = await fetch("/api/send-email", { method: "POST" });
      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      setMessage(`Error sending email: ${error}`);
    }
  };

  return (
    <div>
      <button onClick={sendEmail}>Send Test Email</button>
      <p>{message}</p>
    </div>
  );
}
