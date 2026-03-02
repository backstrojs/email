# Styling Guide

Comprehensive styling reference for Backstro Email templates.

## Styling Approach

There are two ways to style backstro-email templates. Use the approach that fits your project:

| Approach                   | When to use                                                                     |
| -------------------------- | ------------------------------------------------------------------------------- |
| Inline styles (JS objects) | Always safe; maximum email client compatibility                                 |
| Tailwind CSS classes       | When you want utility-first styling; requires `inlineTailwind()` post-processor |

---

## Inline Styles

Pass a JS style object to the `style` prop on any component:

```astro
<Text style={{ color: '#374151', fontSize: '14px', lineHeight: '24px', margin: '0 0 16px' }}>
  Your content here.
</Text>
```

Property names use **camelCase** (JS convention):

```astro
<!-- Correct -->
<Container style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '24px' }}>

<!-- Wrong - kebab-case doesn't work in JS objects -->
<Container style={{ background-color: '#ffffff' }}>
```

---

## Tailwind CSS

Install `tailwindcss`:

```sh
npm install tailwindcss
pnpm add tailwindcss
```

Use `class="..."` attributes on components:

```astro
<Body class="bg-gray-100 font-sans">
  <Container class="bg-white rounded-lg p-8 max-w-xl mx-auto my-10">
    <Heading as="h1" class="text-2xl font-bold text-gray-900">
      Hello!
    </Heading>
    <Text class="text-sm text-gray-600 leading-6">
      Your content here.
    </Text>
  </Container>
</Body>
```

Then inline at render time:

```ts
import { render } from "@backstro/email/render";
import MyEmail from "./emails/MyEmail.astro";

const html = await render(MyEmail, { name: "Alice" }, { tailwind: {} });
```

### No `<Tailwind>` Wrapper

Unlike React Email, there is **no `<Tailwind>` wrapper component** in backstro-email. Tailwind inlining is done as a post-processing step after rendering:

```ts
// Option 1 – via render() options (recommended)
const html = await render(MyEmail, props, { tailwind: {} });

// Option 2 – manual post-processing
import { inlineTailwind } from "@backstro/email/tailwind";
const rawHtml = await render(MyEmail, props);
const html = await inlineTailwind(rawHtml);
```

### Custom Tailwind Config

```ts
const html = await render(MyEmail, props, {
  tailwind: {
    theme: {
      extend: {
        colors: {
          brand: "#0070f3",
          accent: "#7c3aed",
        },
        fontFamily: {
          email: ["Inter", "sans-serif"],
        },
      },
    },
  },
});
```

### How Tailwind Inlining Works

1. Scans all `class="..."` attributes in the rendered HTML
2. Compiles only the detected classes with Tailwind v4
3. **Inlinable rules** (`p-4`, `text-blue-500`, …) → converted to `style="…"` attributes
4. **Non-inlinable rules** (media queries, `hover:`, `focus:`) → injected as `<style>` in `<head>`

Non-inlinable rules only apply in webmail clients (Gmail, Yahoo, Outlook.com) that support `<style>` blocks. Outlook on Windows ignores them.

---

## Email Client Limitations

### Unsupported Features

| Feature                                         | Why                                       | Alternative                      |
| ----------------------------------------------- | ----------------------------------------- | -------------------------------- |
| **SVG/WEBP images**                             | Not rendered in Gmail, Outlook, Yahoo     | Use PNG or JPG                   |
| **Flexbox/Grid**                                | Outlook uses Word engine, no flex support | Use `Row`/`Column` components    |
| **`rem` units**                                 | Email clients vary in base font size      | Use `px` values directly         |
| **CSS custom properties**                       | Not supported broadly                     | Use literal values               |
| **Tailwind responsive prefixes** (`sm:`, `md:`) | Limited client support                    | Use single-column layouts        |
| **Dark mode selectors** (`dark:`)               | Limited client support                    | Avoid or use as enhancement only |

### Border Handling

Always specify border style explicitly. Email clients do not inherit border type:

```astro
<!-- Correct - explicit border style -->
<Hr style={{ borderTopStyle: 'solid', borderTopColor: '#e5e7eb', borderTopWidth: '1px' }} />

<!-- Correct - via Tailwind -->
<Hr class="border-solid border-t border-gray-200" />

<!-- Wrong - no border type, email clients render nothing -->
<Hr style={{ border: '1px #e5e7eb' }} />
```

For single-side borders, reset the other sides:

```astro
<!-- Tailwind: reset then apply one side -->
<div class="border-none border-t border-solid border-t-gray-300" />

<!-- Inline: be explicit -->
<div style={{
  borderTop: '1px solid #d1d5db',
  borderRight: 'none',
  borderBottom: 'none',
  borderLeft: 'none'
}} />
```

---

## Default Layout Structure

### Body

```astro
<Body style={{ backgroundColor: '#f3f4f6', fontFamily: 'sans-serif', padding: '40px 0' }}>
```

### Container

White background, centered, left-aligned content:

```astro
<Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '24px', borderRadius: '8px' }}>
```

### Footer

Include physical address, unsubscribe link, current year:

```astro
---
const year = new Date().getFullYear();
---

<Section style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
  <Text style={{ margin: '0' }}>123 Main St, City, State 12345</Text>
  <Text style={{ margin: '0' }}>© {year} Company Name</Text>
  <Link href={unsubscribeUrl} style={{ color: '#9ca3af' }}>Unsubscribe</Link>
</Section>
```

---

## Typography

### Headings

Bold, larger font, larger margins:

```astro
<Heading as="h1" style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px' }}>
```

### Paragraphs

Regular weight, 14px, tight margins:

```astro
<Text style={{ fontSize: '14px', lineHeight: '24px', color: '#374151', margin: '0 0 12px' }}>
```

---

## Images

- Only include if user requests
- Never use SVG or WEBP — use PNG/JPG only
- Never distort user-provided images
- Use absolute URLs in production (never localhost)
- Always provide `alt` text

```astro
---
const baseURL = import.meta.env.PROD ? 'https://cdn.example.com' : '';
---

<Img
  src={`${baseURL}/static/logo.png`}
  alt="Company Logo"
  width="150"
  height="50"
  style={{ display: 'block' }}
/>
```

---

## Buttons

Always use explicit box-sizing when using padding:

```astro
<Button
  href="https://example.com"
  style={{
    backgroundColor: '#0070f3',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '6px',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'block',
    textAlign: 'center',
    boxSizing: 'border-box',
  }}
>
  Click here
</Button>
```

---

## Dark Mode

When requested: container black (`#000000`), background dark gray (`#151516`).

```astro
<Body style={{ backgroundColor: '#151516', fontFamily: 'sans-serif' }}>
  <Container style={{ backgroundColor: '#000000', color: '#ffffff', padding: '24px', borderRadius: '8px' }}>
```

Note: dark mode via CSS `prefers-color-scheme` has limited email client support. Use it as a progressive enhancement only.
