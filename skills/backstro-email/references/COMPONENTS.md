# Backstro Email Components Reference

Complete reference for all components available in `@backstro/email`. All examples use inline styles for maximum email client compatibility.

**Important:** Only import the components you need. Do not use components in templates without importing them.

## Available Components

All components are imported as named exports from `@backstro/email`:

- **Html** - Root wrapper (`<html>`) with `lang` and `dir` props
- **Head** - `<head>` element with email meta tags pre-injected
- **Body** - `<body>` wrapper with Yahoo/AOL compatibility table
- **Container** - Centers content horizontally (max-width layout)
- **Section** - Full-width layout section
- **Row** - Table row for multi-column layouts
- **Column** - Table cell; must be used inside `Row`
- **Preview** - Hidden inbox preview text
- **Heading** - `h1`–`h6` via `as` prop with margin shorthands
- **Text** - Paragraph block
- **Button** - Styled CTA link (MSO/Outlook conditional comment spacers built-in)
- **Link** - Inline hyperlink (`target="_blank"` default)
- **Img** - Email-safe image (`display: block`, border reset)
- **Hr** - Horizontal divider
- **Font** - `@font-face` injection via `<style>` block
- **CodeBlock** - Syntax-highlighted code (Prism.js)
- **CodeInline** - Inline code (Orange.fr compatible dual `<code>`/`<span>`)
- **Markdown** - Markdown renderer with fully inline styles

## Structural Components

### Html

Root wrapper. Always use as the outermost element.

```astro
---
import { Html } from '@backstro/email';
---

<Html lang="en" dir="ltr">
  <!-- email content -->
</Html>
```

**Props:**

- `lang` – Language code (`"en"`, `"es"`, `"fr"`, …)
- `dir` – Text direction (`"ltr"` or `"rtl"`)
- Any standard HTML attributes

---

### Head

Contains meta elements. Place directly inside `<Html>`.

```astro
---
import { Head } from '@backstro/email';
---

<Head />
```

Pre-injects:

- `Content-Type: text/html; charset=UTF-8`
- `x-apple-disable-message-reformatting` (Apple Mail fix)

---

### Body

`<body>` wrapper. Includes a Yahoo/AOL compatibility outer table to prevent style stripping.

```astro
---
import { Body } from '@backstro/email';
---

<Body style={{ backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
  <!-- email content -->
</Body>
```

**Props:**

- `style` – JS style object; background/color go to outer `<body>`, all other styles go to inner `<td>`
- Any standard HTML body attributes

---

### Container

Centers content horizontally. Default max-width: `37.5em` (600px).

```astro
---
import { Container } from '@backstro/email';
---

<Container style={{ backgroundColor: '#ffffff', padding: '24px' }}>
  <!-- centered content -->
</Container>
```

---

### Section

Full-width table section. Use for distinct content areas.

```astro
---
import { Section } from '@backstro/email';
---

<Section style={{ padding: '16px', backgroundColor: '#f9fafb' }}>
  <!-- section content -->
</Section>
```

---

### Row & Column

Multi-column table-based layout. `Column` must always be inside `Row`.

```astro
---
import { Row, Column } from '@backstro/email';
---

<Row>
  <Column style={{ width: '50%', padding: '8px', verticalAlign: 'top' }}>
    Left column
  </Column>
  <Column style={{ width: '50%', padding: '8px', verticalAlign: 'top' }}>
    Right column
  </Column>
</Row>
```

Column widths should add up to 100%. Always use explicit `width` styles.

---

## Content Components

### Preview

Hidden inbox preview text. Always place as the first element inside `<Body>`.

```astro
---
import { Preview } from '@backstro/email';
---

<Preview>Welcome to our platform – Get started today!</Preview>
```

**Best practices:**

- Keep under 140 characters
- Make it compelling and action-oriented
- Padded with invisible unicode characters to prevent inbox content leak

---

### Heading

Block heading. Renders `h1`–`h6` via the `as` prop.

```astro
---
import { Heading } from '@backstro/email';
---

<Heading as="h1" style={{ color: '#111827', fontSize: '24px', fontWeight: 'bold' }}>
  Welcome!
</Heading>
```

**Props:**

- `as` – `"h1"` | `"h2"` | `"h3"` | `"h4"` | `"h5"` | `"h6"` (default: `"h1"`)
- `m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml` – Margin shorthands (CSS length strings)
- `style` – Additional inline styles
- Any standard heading HTML attributes

**Margin shorthand example:**

```astro
<Heading as="h2" mt="0" mb="16px">Section title</Heading>
```

---

### Text

Paragraph block. Default: `14px / 24px line-height`, `16px` top & bottom margins.

```astro
---
import { Text } from '@backstro/email';
---

<Text style={{ color: '#374151', fontSize: '14px', lineHeight: '24px' }}>
  Your body copy here.
</Text>
```

---

### Button

Styled call-to-action link. Includes MSO conditional comment padding spacers for Outlook on Windows.

```astro
---
import { Button } from '@backstro/email';
---

<Button
  href="https://example.com/verify"
  style={{
    backgroundColor: '#0070f3',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '6px',
    fontWeight: 'bold',
    display: 'block',
    textAlign: 'center',
    textDecoration: 'none',
  }}
>
  Verify Email
</Button>
```

**Props:**

- `href` – Link URL (required)
- `target` – Link target (default: `"_blank"`)
- `style` – Inline styles; `padding` is handled via MSO spacers for Outlook

---

### Link

Inline hyperlink.

```astro
---
import { Link } from '@backstro/email';
---

<Link href="https://example.com" style={{ color: '#0070f3' }}>
  Visit our website
</Link>
```

**Props:**

- `href` – Link URL
- `target` – Default: `"_blank"`

---

### Img

Email-safe image. Renders with `display: block` and border reset.

```astro
---
import { Img } from '@backstro/email';
---

<Img
  src="https://cdn.example.com/logo.png"
  alt="Company Logo"
  width="150"
  height="50"
/>
```

**Important:**

- Always use absolute URLs in production
- Never use SVG or WEBP — use PNG or JPG only
- Always provide `alt` text
- Specify `width` and `height` to prevent layout shifts

---

### Hr

Horizontal rule / divider.

```astro
---
import { Hr } from '@backstro/email';
---

<Hr style={{ borderColor: '#e5e7eb', borderTopWidth: '1px', borderTopStyle: 'solid' }} />
```

**Important:** Always specify `borderTopStyle` (or `borderStyle`). Email clients don't inherit border type — omitting it renders no border.

---

## Specialized Components

### Font

Injects a `@font-face` rule into the `<head>` to load a custom web font.

```astro
---
import { Font } from '@backstro/email';
---

<Head>
  <Font
    fontFamily="Inter"
    fallbackFontFamily="sans-serif"
    webFont={{
      url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
      format: 'woff2',
    }}
    fontWeight={400}
    fontStyle="normal"
  />
</Head>
```

**Props:**

- `fontFamily` – Font name
- `fallbackFontFamily` – CSS fallback (`"sans-serif"`, `"serif"`, `"monospace"`)
- `webFont.url` – Font file URL
- `webFont.format` – `"woff2"` | `"woff"` | `"truetype"` | `"opentype"`
- `fontWeight` – Numeric weight
- `fontStyle` – `"normal"` | `"italic"`

---

### CodeBlock

Syntax-highlighted code block using Prism.js with inline styles.

```astro
---
import { CodeBlock, dracula } from '@backstro/email';
---

<CodeBlock
  code={`const greet = (name) => \`Hello, \${name}!\`;`}
  language="javascript"
  theme={dracula}
/>
```

**Props:**

- `code` – The code string to highlight
- `language` – Prism language identifier (`"javascript"`, `"typescript"`, `"python"`, `"bash"`, …)
- `theme` – Theme object. Available: `dracula`, `githubLight`, `nightOwl`, `vsDark`

**Available themes:**

```ts
import { dracula, githubLight, nightOwl, vsDark } from "@backstro/email";
```

---

### CodeInline

Inline code element, compatible with Orange.fr mail client.

```astro
---
import { CodeInline } from '@backstro/email';
---

<Text>
  Run <CodeInline>npm install</CodeInline> to get started.
</Text>
```

---

### Markdown

Renders a markdown string into inline-styled HTML safe for email clients.

```astro
---
import { Markdown } from '@backstro/email';

const md = `## Hello!\n\nThis is **bold** and _italic_ text.`;
---

<Markdown
  markdownContainerStyles={{ padding: '0 16px' }}
  markdownCustomStyles={{ h2: { color: '#0070f3' } }}
>
  {md}
</Markdown>
```

**Props:**

- `markdownContainerStyles` – Styles for the outer container `<div>`
- `markdownCustomStyles` – Per-element style overrides (`h1`, `h2`, `p`, `a`, `code`, `ul`, `ol`, `li`, `blockquote`, `hr`, `img`)
