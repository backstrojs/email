# Sending Guide

How to render and send Backstro Email templates with various email providers.

**Important:** Always use verified domains in `from` addresses. Ask the user for their verified domain. If they don't have one, ask them to verify it with their provider first.

---

## Rendering

Before sending, render the component to an HTML string (and optionally plain text):

```ts
import { render, renderText } from "@backstro/email/render";
import WelcomeEmail from "./emails/WelcomeEmail.astro";

const props = { name: "Alice", verificationUrl: "https://example.com/verify" };

const html = await render(WelcomeEmail, props);
const text = await renderText(WelcomeEmail, props); // plain text fallback
```

### With Tailwind CSS

```ts
const html = await render(WelcomeEmail, props, {
  tailwind: {
    theme: {
      extend: {
        colors: { brand: "#0070f3" },
      },
    },
  },
});
```

---

## Resend (Recommended)

Install the Resend SDK:

```sh
npm install resend
pnpm add resend
```

### With the Resend MCP Tool

When you have access to the Resend MCP tool:

```ts
import { render, renderText } from "@backstro/email/render";
import WelcomeEmail from "./emails/WelcomeEmail.astro";

const props = { name: "Alice", verificationUrl: "https://example.com/verify" };
const html = await render(WelcomeEmail, props);
const text = await renderText(WelcomeEmail, props);

// Use Resend MCP send-email tool with:
// - to: recipient@example.com
// - subject: Welcome to Acme
// - html: html
// - text: text
```

### Without MCP (Resend SDK)

```ts
import { render, renderText } from "@backstro/email/render";
import { Resend } from "resend";
import WelcomeEmail from "./emails/WelcomeEmail.astro";

const resend = new Resend(process.env.RESEND_API_KEY);

const props = { name: "Alice", verificationUrl: "https://example.com/verify" };

const { data, error } = await resend.emails.send({
  from: "Acme <onboarding@yourdomain.com>",
  to: ["user@example.com"],
  subject: "Welcome to Acme",
  html: await render(WelcomeEmail, props),
  text: await renderText(WelcomeEmail, props),
});

if (error) {
  console.error("Failed to send:", error);
}
```

---

## Nodemailer

```sh
npm install nodemailer
npm install -D @types/nodemailer
```

```ts
import { render, renderText } from "@backstro/email/render";
import nodemailer from "nodemailer";
import WelcomeEmail from "./emails/WelcomeEmail.astro";

const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const props = { name: "Alice", verificationUrl: "https://example.com/verify" };

await transporter.sendMail({
  from: "Acme <noreply@yourdomain.com>",
  to: "user@example.com",
  subject: "Welcome to Acme",
  html: await render(WelcomeEmail, props),
  text: await renderText(WelcomeEmail, props),
});
```

---

## SendGrid

```sh
npm install @sendgrid/mail
```

```ts
import { render, renderText } from "@backstro/email/render";
import sgMail from "@sendgrid/mail";
import WelcomeEmail from "./emails/WelcomeEmail.astro";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const props = { name: "Alice", verificationUrl: "https://example.com/verify" };

await sgMail.send({
  from: "Acme <noreply@yourdomain.com>",
  to: "user@example.com",
  subject: "Welcome to Acme",
  html: await render(WelcomeEmail, props),
  text: await renderText(WelcomeEmail, props),
});
```

---

## AWS SES

```sh
npm install @aws-sdk/client-ses
```

```ts
import { render, renderText } from "@backstro/email/render";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import WelcomeEmail from "./emails/WelcomeEmail.astro";

const ses = new SESClient({ region: process.env.AWS_REGION });

const props = { name: "Alice", verificationUrl: "https://example.com/verify" };

await ses.send(
  new SendEmailCommand({
    Source: "Acme <noreply@yourdomain.com>",
    Destination: { ToAddresses: ["user@example.com"] },
    Message: {
      Subject: { Data: "Welcome to Acme" },
      Body: {
        Html: { Data: await render(WelcomeEmail, props) },
        Text: { Data: await renderText(WelcomeEmail, props) },
      },
    },
  }),
);
```

---

## Cloudflare Workers

For Workers, use `nodejs_compat` and render on the Worker directly:

```toml
# wrangler.toml
name = "my-email-worker"
main = "src/index.ts"
compatibility_date = "2026-03-01"
compatibility_flags = ["nodejs_compat"]
```

```ts
// src/index.ts
import { render, renderText } from "@backstro/email/render";
import WelcomeEmail from "../emails/WelcomeEmail.astro";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { name, email } = await request.json<{
      name: string;
      email: string;
    }>();

    const props = {
      name,
      verificationUrl: `https://example.com/verify?email=${email}`,
    };

    const html = await render(WelcomeEmail, props);
    const text = await renderText(WelcomeEmail, props);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Acme <noreply@yourdomain.com>",
        to: email,
        subject: "Welcome to Acme",
        html,
        text,
      }),
    });

    return Response.json(await res.json());
  },
};

interface Env {
  RESEND_API_KEY: string;
}
```

---

## Best Practices

1. **Always include a plain text version** — required for accessibility and some email clients
2. **Use verified sender domains** — avoid spam filters; never use `@gmail.com` or `@yahoo.com` as sender
3. **Test before sending** — check in Gmail, Outlook, Apple Mail, Yahoo Mail
4. **Handle errors** — always catch and log send failures
5. **Keep HTML under 102KB** — Gmail clips larger emails
6. **Use absolute image URLs** — hosted on a CDN, not localhost
