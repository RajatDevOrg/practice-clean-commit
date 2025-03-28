import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

async function sendSimpleMessage() {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.API_KEY || "API_KEY",
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net"
  });
  try {
    const data = await mg.messages.create(
      "sandbox81a3c45ce00b4fbea83ab3d85d6a99cd.mailgun.org",
      {
        from: "Mailgun Sandbox <postmaster@sandbox81a3c45ce00b4fbea83ab3d85d6a99cd.mailgun.org>",
        to: ["Rajat kumar <rajat812678@gmail.com>"],
        subject: "Hello Rajat kumar",
        text: "Congratulations Rajat kumar, you just sent an email with Mailgun! You are truly awesome!",
      }
    );

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}

export default sendSimpleMessage;
