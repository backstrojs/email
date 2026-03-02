```skill
---
name: backstro-email
description: Use when creating HTML email templates with Astro components - welcome emails, password resets, notifications, order confirmations, newsletters, or transactional emails using the @backstro/email library.
license: MIT
metadata:
  author: Backstro
  version: "1.0.0"
---

# Backstro Email

Build and send HTML emails using Astro components - a modern, component-based approach to email development that works across all major email clients.

## Installation

Install the package in your existing project:

```sh
npm install @backstro/email
```

```sh
pnpm add @backstro/email
```

```sh
yarn add @backstro/email
```

## Basic Email Template

Create a `.astro` file in your `emails/` folder:

```astro
---
// emails/WelcomeEmail.astro
import { Html, Head, Body, Container, Preview, Heading, Text, Button } from '@backstro/email';

interface Props {
  name: string;
  verificationUrl: string;
}

const { name, verificationUrl } = Astro.props;
---

<Html lang="en">
  <Head />
  <Body style={{ backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
    <Preview>Welcome – Verify your email</Preview>
    <Container>
      <Heading as="h1">Welcome!</Heading>
      <Text>Hi {name}, thanks for signing up!</Text>
      <Button href={verificationUrl}>Verify Email</Button>
    </Container>
  </Body>
</Html>
```

**Key differences from React Email:**
- Files are `.astro`, not `.tsx`
- Props are accessed via `Astro.props`, not function parameters
- Define props with `interface Props` in the frontmatter (`---` block)
- Conditionals and loops use Astro template expressions: `{condition && <Component />}`, `{items.map(item => <Component />)}`
- No JSX — Astro template syntax
- No `PreviewProps` — pass props at render time

## Essential Components

See [references/COMPONENTS.md](references/COMPONENTS.md) for complete component documentation.

**Core Structure:**
- `Html` - Root wrapper with `lang` attribute
- `Head` - Meta elements, styles, fonts
- `Body` - Main content wrapper (Yahoo/AOL compat table included)
- `Container` - Centers content (max-width layout)
- `Preview` - Inbox preview text
- `Section` - Layout sections
- `Row` & `Column` - Multi-column layouts

**Content:**
- `Heading` - h1–h6 via `as` prop; supports margin shorthands (`m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml`)
- `Text` - Paragraphs
- `Button` - Styled link buttons (MSO conditional comments for Outlook padding)
- `Link` - Hyperlinks
- `Img` - Images
- `Hr` - Horizontal dividers

**Specialized:**
- `CodeBlock` - Syntax-highlighted code (Prism.js themes)
- `CodeInline` - Inline code (Orange.fr compatible)
- `Markdown` - Render markdown with inline styles
- `Font` - Custom web fonts via `@font-face`

## Before Writing Code

When a user requests an email template, ask clarifying questions FIRST if they haven't provided:

1. **Brand colors** - Ask for primary brand color (hex code like #007bff)
2. **Logo** - Ask if they have a logo file and its format (PNG/JPG only - warn if SVG/WEBP)
3. **Style preference** - Professional, casual, or minimal tone
4. **Production URL** - Where will static assets be hosted in production?

## Static Files and Images

Local images must be placed in the `public/` or `static/` folder and served as absolute URLs in production.

```
project/
├── emails/
│   └── WelcomeEmail.astro
└── public/
    └── logo.png          <-- images go here
```

Use `import.meta.env` for environment-specific URLs:

```astro
---
const baseURL = import.meta.env.PROD
  ? 'https://cdn.example.com'
  : '';
---

<Img src={`${baseURL}/logo.png`} alt="Logo" width="150" height="50" />
```

## Loops and Conditionals

Because email templates are Astro components, native Astro template syntax works:

```astro
---
interface Props {
  items: Array<{ name: string; qty: number; price: number }>;
  isPremium: boolean;
}
const { items, isPremium } = Astro.props;
---

{/* Conditional */}
{isPremium && (
  <Section>
    <Text style={{ color: '#f59e0b', fontWeight: 'bold' }}>Premium member</Text>
  </Section>
)}

{/* Loop */}
{items.map((item) => (
  <Row>
    <Column><Text>{item.name}</Text></Column>
    <Column><Text>{item.qty}</Text></Column>
    <Column><Text>${(item.qty * item.price).toFixed(2)}</Text></Column>
  </Row>
))}
```

## Styling

See [references/STYLING.md](references/STYLING.md) for complete styling documentation.

Use **inline styles** (via the `style` prop, which accepts a JS object) for maximum email client compatibility:

```astro
<Text style={{ color: '#374151', fontSize: '14px', lineHeight: '24px' }}>
  Hello world
</Text>
```

### Tailwind CSS (optional)

Install `tailwindcss` and use class names. Run `inlineTailwind()` as a post-processing step after rendering:

```ts
import { render } from '@backstro/email/render';
import WelcomeEmail from './emails/WelcomeEmail.astro';

const html = await render(WelcomeEmail, { name: 'Alice' }, { tailwind: {} });
```

When using Tailwind:
- Use utility classes via `class="..."` on components
- No `<Tailwind>` wrapper component needed — inlining is done post-render
- Email client limitations still apply (see [references/STYLING.md](references/STYLING.md))

### Email Client Limitations
- Never use SVG or WEBP — warn users about rendering issues
- Never use flexbox — use `Row`/`Column` components for layouts
- Never use CSS media queries — not reliably supported in email clients
- Always specify explicit border styles on `<Hr>` and bordered elements
- Border single-side: include a reset (e.g. `borderTop: 'none'`) for other sides

## Rendering

### Convert to HTML

```ts
import { render } from '@backstro/email/render';
import WelcomeEmail from './emails/WelcomeEmail.astro';

const html = await render(WelcomeEmail, { name: 'Alice', verificationUrl: 'https://example.com/verify' });
```

### Convert to Plain Text

```ts
import { renderText } from '@backstro/email/render';
import WelcomeEmail from './emails/WelcomeEmail.astro';

const text = await renderText(WelcomeEmail, { name: 'Alice', verificationUrl: 'https://example.com/verify' });
```

### With Tailwind

```ts
const html = await render(WelcomeEmail, props, { tailwind: {} });

// With custom Tailwind config:
const html = await render(WelcomeEmail, props, {
  tailwind: {
    theme: {
      extend: {
        colors: { brand: '#0070f3' },
      },
    },
  },
});
```

## Sending

See [references/SENDING.md](references/SENDING.md) for provider guides.

Quick example using Resend:

```ts
import { render } from '@backstro/email/render';
import { Resend } from 'resend';
import WelcomeEmail from './emails/WelcomeEmail.astro';

const resend = new Resend(process.env.RESEND_API_KEY);

const html = await render(WelcomeEmail, { name: 'Alice', verificationUrl: 'https://example.com/verify' });
const text = await renderText(WelcomeEmail, { name: 'Alice', verificationUrl: 'https://example.com/verify' });

const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Welcome to Acme',
  html,
  text,
});

if (error) {
  console.error('Failed to send:', error);
}
```

## Internationalization

See [references/I18N.md](references/I18N.md) for complete i18n documentation.

Quick example using a `locale` prop pattern:

```astro
---
interface Props {
  name: string;
  locale: 'en' | 'es' | 'fr';
}

const { name, locale } = Astro.props;

const messages = {
  en: { greeting: 'Hi', cta: 'Get Started' },
  es: { greeting: 'Hola', cta: 'Comenzar' },
  fr: { greeting: 'Bonjour', cta: 'Commencer' },
};

const t = messages[locale];
---

<Html lang={locale}>
  <Head />
  <Body>
    <Container>
      <Text>{t.greeting} {name},</Text>
      <Button href="https://example.com">{t.cta}</Button>
    </Container>
  </Body>
</Html>
```

## Behavioral Guidelines

- When re-iterating over code, only update what the user asked for; keep the rest intact
- Never use template variables (like `{{name}}`) directly in Astro expressions — reference props directly (`{name}`)
- If a user explicitly wants `{{name}}` as a literal string (for use with external templating), use it only as a **default prop value** at render time, never inside the template itself
- If the user asks to use media queries in CSS, inform them email client support is limited and suggest inline conditional layouts instead
- Always use `interface Props` in the frontmatter to type component props
- Component imports must use the full package path from `@backstro/email`

## Cloudflare Workers

Astro email works in Cloudflare Workers with the `nodejs_compat` flag — `AstroContainer` requires Node stream polyfills.

```toml
# wrangler.toml
compatibility_flags = ["nodejs_compat"]
```

For Tailwind inlining in Workers, pass the CSS as a string (avoids `fs.readFile`):

```ts
import tailwindCss from 'tailwindcss/index.css?raw'; // bundled by wrangler

const html = await render(MyEmail, props, {
  tailwind: { cssSource: tailwindCss },
});
```

## Common Patterns

See [references/PATTERNS.md](references/PATTERNS.md) for complete examples including:
- Password reset emails
- Order confirmations with product lists
- Notifications with code blocks
- Multi-column layouts
- Custom fonts

## Additional Resources

- [Astro Documentation](https://docs.astro.build)
- [Email Client CSS Support](https://www.caniemail.com)
- Component Reference: [references/COMPONENTS.md](references/COMPONENTS.md)
- Styling Guide: [references/STYLING.md](references/STYLING.md)
- Common Patterns: [references/PATTERNS.md](references/PATTERNS.md)
- Sending Guide: [references/SENDING.md](references/SENDING.md)
- Internationalization: [references/I18N.md](references/I18N.md)
```
