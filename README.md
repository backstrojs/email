# @backstro/email

> Compose email templates with Astro components — a direct port of
> [react-email](https://react.email) component to native `.astro` syntax.

## Why?

- **No React required** — pure Astro components with zero client-side JavaScript.
- **Same HTML output** — MSO/Outlook conditional comments, Yahoo-compatibility
  tables, and Orange.fr hacks are all preserved.
- **Server-side rendering** — perfect for SSR routes, API endpoints, or any
  Node.js email-sending workflow.

## Installation

```sh
npm install @backstro/email
# or
pnpm add @backstro/email
```

`astro >= 4.0` is the only peer dependency.

## Quick start

### 1. Create your email template

```astro
---
// src/emails/WelcomeEmail.astro
import {
  Html, Head, Body, Container,
  Section, Heading, Text, Button,
  Hr, Preview, Font,
} from '@backstro/email';

interface Props {
  name: string;
  url: string;
}
const { name, url } = Astro.props;
---

<Html lang="en">
  <Head>
    <title>Welcome, {name}!</title>
    <Font
      fontFamily="Inter"
      fallbackFontFamily={['Arial', 'sans-serif']}
      webFont={{
        url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
        format: 'woff2',
      }}
    />
  </Head>
  <Body style={{ backgroundColor: '#f5f5f5' }}>
    <Preview>Welcome to our platform, {name} 🎉</Preview>
    <Container style={{ backgroundColor: '#ffffff', padding: '40px 24px' }}>
      <Section>
        <Heading as="h1" style={{ color: '#111', fontSize: '28px' }}>
          Hi {name}, welcome aboard!
        </Heading>
        <Text>
          We're thrilled to have you. Click the button below to confirm your
          email address and get started.
        </Text>
        <Hr />
        <Button
          href={url}
          style={{
            backgroundColor: '#0070f3',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '6px',
            fontWeight: '600',
          }}
        >
          Confirm email address
        </Button>
        <Text style={{ color: '#666', fontSize: '12px', marginTop: '32px' }}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Section>
    </Container>
  </Body>
</Html>
```

### 2. Render to HTML from a server endpoint

```ts
// src/pages/api/send-welcome.ts
import type { APIRoute } from "astro";
import { render } from "@backstro/email/render";
import WelcomeEmail from "../../emails/WelcomeEmail.astro";

export const POST: APIRoute = async ({ request }) => {
  const { name, email } = await request.json();
  const html = await render(WelcomeEmail, {
    name,
    url: "https://example.com/confirm",
  });

  // Pass `html` to any sending service (Resend, Nodemailer, SES, …)
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "hello@example.com",
      to: email,
      subject: `Welcome, ${name}!`,
      html,
    }),
  });

  return new Response(JSON.stringify({ ok: true }));
};
```

## Components

| Component      | HTML output            | Notes                                      |
| -------------- | ---------------------- | ------------------------------------------ |
| `<Html>`       | `<html>`               | Sets `lang` + `dir`                        |
| `<Head>`       | `<head>`               | Injects required email meta tags           |
| `<Body>`       | `<body>` / table       | Yahoo/AOL margin-reset wrapper             |
| `<Preview>`    | hidden `<div>`         | Inbox preview text (≤ 150 chars)           |
| `<Container>`  | centered `<table>`     | `maxWidth: 37.5em`                         |
| `<Section>`    | full-width `<table>`   | Block-level section                        |
| `<Row>`        | `<table>` + `<tr>`     | Horizontal row                             |
| `<Column>`     | `<td>`                 | Use inside `<Row>`                         |
| `<Heading>`    | `<h1>`–`<h6>`          | `as` + margin shorthands                   |
| `<Text>`       | `<p>`                  | 14 px / 24 px line-height defaults         |
| `<Button>`     | `<a>` + MSO spacers    | Outlook-compatible padded button           |
| `<Link>`       | `<a>`                  | Opens in new tab by default                |
| `<Img>`        | `<img>`                | `display:block` + border reset             |
| `<Hr>`         | `<hr>`                 | Full-width rule                            |
| `<Font>`       | `<style>` `@font-face` | Place inside `<Head>`                      |
| `<CodeBlock>`  | `<pre><code>`          | Prism.js inline-styled syntax highlighting |
| `<CodeInline>` | `<code>` + `<span>`    | Orange.fr-compatible inline code           |
| `<Markdown>`   | rendered HTML          | Inline-styled Markdown via `marked`        |

## CodeBlock themes

Four themes are built in:

```ts
import { themes } from "@backstro/email";
// themes.dracula | themes.githubLight | themes.nightOwl | themes.vsDark
```

Pass your chosen theme to the `theme` prop:

```astro
---
import { CodeBlock, themes } from '@backstro/email';
---
<CodeBlock
  code={`const greet = (name: string) => \`Hello, \${name}!\`;`}
  language="typescript"
  theme={themes.dracula}
  lineNumbers
/>
```

You can also supply your own custom theme — any object that maps Prism token
type names to CSS-in-JS style objects, plus a `base` key for the outer `<pre>`:

```ts
import type { Theme } from "@backstro/email";

export const myTheme: Theme = {
  base: { background: "#1a1a1a", color: "#eee", padding: "16px" },
  keyword: { color: "#ff79c6" },
  string: { color: "#f1fa8c" },
  // …
};
```

## Heading margin shorthands

`<Heading>` accepts shorthand margin props identical to react-email's version:

| Prop | CSS equivalent                 |
| ---- | ------------------------------ |
| `m`  | `margin`                       |
| `mx` | `margin-left` + `margin-right` |
| `my` | `margin-top` + `margin-bottom` |
| `mt` | `margin-top`                   |
| `mr` | `margin-right`                 |
| `mb` | `margin-bottom`                |
| `ml` | `margin-left`                  |

```astro
<Heading as="h2" mt={40} mb={16}>Section title</Heading>
```

## Render utility

```ts
import { render, renderText } from "@backstro/email/render";

// Full HTML
const html = await render(MyEmail, { name: "Alice" });

// Plain-text fallback (strips tags)
const text = await renderText(MyEmail, { name: "Alice" });
```

Both functions use Astro's `AstroContainer` API (stable since Astro 4.9).

## Inline styles

All style props accept a plain JavaScript object (CSS-in-JS). Astro serialises
them to `style="..."` attributes on the rendered HTML, which is exactly what
email clients require.

```astro
<Text style={{ color: '#333', fontSize: '16px', lineHeight: '28px' }}>
  Styled text
</Text>
```

## Markdown

```astro
---
import { Markdown } from '@backstro/email';

const md = `
# Update available

We've just shipped **version 2.0**. Here's what's new:

- Faster rendering
- Dark-mode support
- [See the changelog](https://example.com/changelog)
`;
---
<Markdown
  markdownContainerStyles={{ fontFamily: 'sans-serif', color: '#333' }}
  markdownCustomStyles={{ h1: { color: '#0070f3' } }}
>
  {md}
</Markdown>
```

## Tailwind CSS support

Install `tailwindcss` (v4):

```sh
npm install tailwindcss
```

Use Tailwind utility classes directly on your components:

```astro
---
// emails/PromoEmail.astro
import { Html, Head, Body, Container, Heading, Text, Button } from '@backstro/email';
---

<Html>
  <Head />
  <Body class="bg-gray-50 font-sans">
    <Container class="bg-white rounded-lg p-8 max-w-xl mx-auto my-10">
      <Heading as="h1" class="text-2xl font-bold text-blue-600">
        Hello from Astro Email!
      </Heading>
      <Text class="text-gray-600 text-sm leading-6 mt-4">
        This email was built with Astro components and styled with Tailwind CSS.
      </Text>
      <Button
        href="https://example.com"
        class="bg-blue-600 text-white font-semibold py-3 px-6 rounded mt-6"
      >
        Get started
      </Button>
    </Container>
  </Body>
</Html>
```

Pass a `tailwind` option to `render()` to automatically inline all Tailwind classes:

```ts
import { render } from "@backstro/email/render";
import PromoEmail from "./emails/PromoEmail.astro";

// All Tailwind classes are converted to inline styles automatically.
const html = await render(PromoEmail, { name: "Alice" }, { tailwind: {} });
```

You can also call `inlineTailwind` manually for full control:

```ts
import { inlineTailwind } from "@backstro/email/tailwind";

const rawHtml = await render(PromoEmail);
const html = await inlineTailwind(rawHtml, {
  config: {
    theme: {
      extend: {
        colors: { brand: "#0070f3" },
      },
    },
  },
});
```

### How it works

`inlineTailwind` works as an HTML post-processor:

1. Scans all `class="..."` attributes in the rendered HTML.
2. Compiles only the detected classes with the Tailwind v4 compiler.
3. Converts **inlinable rules** (`p-4`, `text-blue-500`, …) to `style="…"` attributes directly on each element.
4. Injects **non-inlinable rules** (media queries, hover/focus pseudo-classes, …) as a `<style>` block inside `<head>`.

> **Note:** Hover/focus effects will only work in email clients that support `<style>` blocks (most webmail clients do). Outlook on Windows will ignore them.

## License

MIT
