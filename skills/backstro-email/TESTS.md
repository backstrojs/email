# Backstro Email Skill Tests

Test scenarios for verifying skill compliance. Follow TDD: run these WITHOUT skill to establish baseline, then WITH skill to verify compliance.

---

## Email Client Limitations Tests

### Test A1: Template Variables ({{name}})

**Scenario:** User wants mustache-style template variables.

**Prompt:**

```
Create a welcome email with a {{firstName}} placeholder for personalization - I use this with my templating system.
```

**Expected Behavior:**

- Use `{firstName}` inside the template (valid Astro expression)
- Put `"{{firstName}}"` ONLY as a prop value passed at render time
- Explain why mustache syntax cannot go directly in Astro template expressions

**Pass Criteria:**

```astro
---
const { firstName } = Astro.props;
---

<!-- CORRECT -->
<Text>Hello {firstName}</Text>
```

```ts
// Render with literal placeholder for external templating:
const html = await render(Email, { firstName: "{{firstName}}" });
```

```astro
<!-- WRONG - breaks Astro parsing -->
<Text>Hello {{firstName}}</Text>
```

---

### Test A2: SVG/WEBP Images

**Scenario:** User wants to use an SVG logo.

**Prompt:**

```
Create an email with my SVG logo embedded inline.
```

**Expected Behavior:**

- Warn user that SVG/WEBP don't render reliably in email clients (Gmail, Outlook, Yahoo)
- Suggest using PNG or JPG instead
- Do NOT embed inline SVG

**Pass Criteria:**
Agent refuses to use SVG and explains which email clients don't support it.

---

### Test A3: Flexbox Layout

**Scenario:** User requests flexbox.

**Prompt:**

```
Create an email with a flexible two-column layout using flexbox.
```

**Expected Behavior:**

- Explain flexbox is not supported (Outlook uses Word rendering engine)
- Use `Row`/`Column` components instead
- Do NOT use `display: flex` or `flexDirection`

**Pass Criteria:**

```astro
<!-- CORRECT -->
<Row>
  <Column style={{ width: '50%' }}>Left</Column>
  <Column style={{ width: '50%' }}>Right</Column>
</Row>

<!-- WRONG -->
<div style={{ display: 'flex' }}>...</div>
```

---

### Test A4: Media Queries

**Scenario:** User requests responsive breakpoints.

**Prompt:**

```
Make the email responsive with sm: and md: Tailwind classes.
```

**Expected Behavior:**

- Warn that `sm:`, `md:`, `lg:` Tailwind responsive prefixes are not reliably supported in email clients
- Suggest using a single-column layout with a max-width `Container` instead
- If Tailwind is in use, non-inlinable rules (including media queries) are injected via `<style>` — note that only webmail clients will apply them

**Pass Criteria:**
Agent warns about limited support and either avoids responsive prefixes or clearly notes the risk.

---

## Astro-Specific Tests

### Test B1: Correct Props Access

**Scenario:** User asks for a component with props.

**Prompt:**

```
Create a password reset email with a resetUrl prop.
```

**Expected Behavior:**

- Define `interface Props { resetUrl: string }` in frontmatter
- Destructure from `Astro.props`
- NOT use function parameters syntax

**Pass Criteria:**

```astro
---
interface Props {
  resetUrl: string;
}
const { resetUrl } = Astro.props;
---
```

```astro
<!-- WRONG - React syntax -->
export default function Email({ resetUrl }: { resetUrl: string }) { ... }
```

---

### Test B2: Loops in Templates

**Scenario:** User needs to render a list of items.

**Prompt:**

```
Create an order confirmation email that loops over a list of ordered items.
```

**Expected Behavior:**

- Use `{items.map(item => (...))}` inside the Astro template
- NOT create a separate React component for the list

**Pass Criteria:**

```astro
{items.map((item) => (
  <Row>
    <Column><Text>{item.name}</Text></Column>
    <Column><Text>${item.price.toFixed(2)}</Text></Column>
  </Row>
))}
```

---

### Test B3: Conditionals in Templates

**Scenario:** User wants to show a section only for premium users.

**Prompt:**

```
Show a "Premium member" banner only if isPremium is true.
```

**Expected Behavior:**

- Use `{isPremium && (...)}` or `{isPremium ? (...) : (...)}`

**Pass Criteria:**

```astro
{isPremium && (
  <Section>
    <Text style={{ color: '#f59e0b' }}>Premium member</Text>
  </Section>
)}
```

---

### Test B4: Correct Import Paths

**Scenario:** User starts a new email template.

**Prompt:**

```
Create a basic welcome email component.
```

**Expected Behavior:**

- Import components from `@backstro/email`
- NOT from `@react-email/components`
- Use `.astro` file extension

**Pass Criteria:**

```astro
---
import { Html, Head } from '@backstro/email';
// etc.
---
```

---

### Test B5: Rendering API

**Scenario:** User asks how to convert the template to HTML for sending.

**Prompt:**

```
How do I render my Astro email to an HTML string?
```

**Expected Behavior:**

- Use `render(Component, props)` from `@backstro/email/render`
- NOT `render(<Component {...props} />)` (React JSX syntax)

**Pass Criteria:**

```ts
// CORRECT
import { render } from '@backstro/email/render';
import WelcomeEmail from './emails/WelcomeEmail.astro';

const html = await render(WelcomeEmail, { name: 'Alice' });

// WRONG - React syntax
const html = await render(<WelcomeEmail name="Alice" />);
```

---

### Test B6: Tailwind Usage

**Scenario:** User asks to use Tailwind CSS.

**Prompt:**

```
Create the email using Tailwind classes for styling.
```

**Expected Behavior:**

- Use `class="..."` attributes on components
- NO `<Tailwind>` wrapper component (does not exist in backstro-email)
- Run `inlineTailwind()` or pass `{ tailwind: {} }` to `render()` at render time

**Pass Criteria:**

```astro
<!-- CORRECT -->
<Container class="bg-white rounded-lg p-8 max-w-xl mx-auto">
  <Text class="text-gray-600 text-sm">Hello</Text>
</Container>
```

```ts
// CORRECT - inlining at render time
const html = await render(MyEmail, props, { tailwind: {} });
```

```astro
<!-- WRONG - does not exist -->
<Tailwind config={...}>
  ...
</Tailwind>
```

---

## Cloudflare Workers Tests

### Test C1: Workers Compatibility

**Scenario:** User wants to render emails inside a Cloudflare Worker.

**Prompt:**

```
How do I render my Astro email inside a Cloudflare Worker?
```

**Expected Behavior:**

- Tell user to use `nodejs_compat` compatibility flag
- Show proper wrangler.toml config
- Explain that static import map is required (no dynamic `import(variable)`)

**Pass Criteria:**

```toml
compatibility_flags = ["nodejs_compat"]
```

```ts
// Static map required
const templates = {
  welcome: () => import("../emails/WelcomeEmail.astro"),
};
```
