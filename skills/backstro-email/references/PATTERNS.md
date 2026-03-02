# Common Email Patterns

Real-world examples of common email templates using Backstro Email with inline styles.

---

## Password Reset Email

```astro
---
// emails/PasswordReset.astro
import { Html, Head, Body, Container, Preview, Heading, Text, Button, Hr } from '@backstro/email';

interface Props {
  resetUrl: string;
  email: string;
  expiryHours?: number;
}

const { resetUrl, email, expiryHours = 1 } = Astro.props;
---

<Html lang="en">
  <Head />
  <Body style={{ backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
    <Preview>Reset your password – Action required</Preview>
    <Container style={{ backgroundColor: '#ffffff', margin: '40px auto', padding: '24px', maxWidth: '560px', borderRadius: '8px' }}>
      <Heading as="h1" style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px' }}>
        Reset Your Password
      </Heading>
      <Text style={{ fontSize: '14px', lineHeight: '24px', color: '#374151', margin: '0 0 12px' }}>
        A password reset was requested for your account: <strong>{email}</strong>
      </Text>
      <Text style={{ fontSize: '14px', lineHeight: '24px', color: '#374151', margin: '0 0 20px' }}>
        Click the button below to reset your password. This link expires in {expiryHours} hour{expiryHours > 1 ? 's' : ''}.
      </Text>
      <Button
        href={resetUrl}
        style={{
          backgroundColor: '#dc2626',
          color: '#ffffff',
          padding: '12px 28px',
          borderRadius: '6px',
          fontWeight: 'bold',
          textDecoration: 'none',
          display: 'block',
          textAlign: 'center',
          boxSizing: 'border-box',
          margin: '0 0 24px',
        }}
      >
        Reset Password
      </Button>
      <Hr style={{ borderTopStyle: 'solid', borderTopColor: '#e5e7eb', borderTopWidth: '1px', margin: '0 0 16px' }} />
      <Text style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px' }}>
        If you didn't request this, please ignore this email. Your password will remain unchanged.
      </Text>
      <Text style={{ fontSize: '13px', color: '#6b7280', margin: '0' }}>
        For security, this link will only work once.
      </Text>
    </Container>
  </Body>
</Html>
```

---

## Order Confirmation with Product List (Loop)

```astro
---
// emails/OrderConfirmation.astro
import { Html, Head, Body, Container, Section, Row, Column, Preview, Heading, Text, Hr } from '@backstro/email';

interface Product {
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  orderNumber: string;
  items: Product[];
  subtotal: number;
  shipping: number;
  total: number;
}

const { orderNumber, items, subtotal, shipping, total } = Astro.props;
---

<Html lang="en">
  <Head />
  <Body style={{ backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
    <Preview>Order #{orderNumber} confirmed – Thank you!</Preview>
    <Container style={{ backgroundColor: '#ffffff', margin: '40px auto', padding: '24px', maxWidth: '560px', borderRadius: '8px' }}>
      <Heading as="h1" style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px' }}>
        Order Confirmed
      </Heading>
      <Text style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px' }}>
        Thank you for your order!
      </Text>

      <Section style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '6px', marginBottom: '24px' }}>
        <Row>
          <Column style={{ width: '50%' }}>
            <Text style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 4px' }}>Order Number</Text>
            <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', margin: '0' }}>#{orderNumber}</Text>
          </Column>
        </Row>
      </Section>

      {/* Product loop */}
      {items.map((item) => (
        <Row style={{ marginBottom: '12px' }}>
          <Column style={{ width: '60%' }}>
            <Text style={{ fontSize: '14px', color: '#374151', margin: '0' }}>{item.name}</Text>
            <Text style={{ fontSize: '12px', color: '#9ca3af', margin: '0' }}>Qty: {item.quantity}</Text>
          </Column>
          <Column style={{ width: '40%', textAlign: 'right' }}>
            <Text style={{ fontSize: '14px', color: '#374151', margin: '0' }}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </Column>
        </Row>
      ))}

      <Hr style={{ borderTopStyle: 'solid', borderTopColor: '#e5e7eb', borderTopWidth: '1px', margin: '16px 0' }} />

      <Row>
        <Column style={{ width: '60%' }}>
          <Text style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>Subtotal</Text>
          <Text style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>Shipping</Text>
          <Text style={{ fontSize: '15px', fontWeight: 'bold', color: '#111827', margin: '8px 0 0' }}>Total</Text>
        </Column>
        <Column style={{ width: '40%', textAlign: 'right' }}>
          <Text style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>${subtotal.toFixed(2)}</Text>
          <Text style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>${shipping.toFixed(2)}</Text>
          <Text style={{ fontSize: '15px', fontWeight: 'bold', color: '#111827', margin: '8px 0 0' }}>${total.toFixed(2)}</Text>
        </Column>
      </Row>
    </Container>
  </Body>
</Html>
```

---

## Conditional Content (Premium vs Free)

```astro
---
// emails/WelcomeEmail.astro
import { Html, Head, Body, Container, Section, Preview, Heading, Text, Button, Hr } from '@backstro/email';

interface Props {
  name: string;
  isPremium: boolean;
  features: string[];
}

const { name, isPremium, features } = Astro.props;
---

<Html lang="en">
  <Head />
  <Body style={{ backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
    <Preview>Welcome, {name}!</Preview>
    <Container style={{ backgroundColor: '#ffffff', margin: '40px auto', padding: '24px', maxWidth: '560px', borderRadius: '8px' }}>
      <Heading as="h1" style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px' }}>
        Welcome, {name}!
      </Heading>

      {/* Conditional premium badge */}
      {isPremium && (
        <Section style={{ backgroundColor: '#fef3c7', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px' }}>
          <Text style={{ color: '#92400e', fontWeight: 'bold', fontSize: '14px', margin: '0' }}>
            ⭐ You're on the Premium plan
          </Text>
        </Section>
      )}

      <Text style={{ fontSize: '14px', lineHeight: '24px', color: '#374151', margin: '0 0 16px' }}>
        {isPremium ? "Here's everything included in your Premium plan:" : "Here's what you get with your free plan:"}
      </Text>

      {/* Feature loop */}
      {features.map((feature) => (
        <Text style={{ fontSize: '14px', color: '#374151', margin: '0 0 8px' }}>
          ✅ {feature}
        </Text>
      ))}

      <Hr style={{ borderTopStyle: 'solid', borderTopColor: '#e5e7eb', borderTopWidth: '1px', margin: '24px 0' }} />

      {!isPremium && (
        <Button
          href="https://example.com/upgrade"
          style={{
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            display: 'block',
            textAlign: 'center',
            fontWeight: 'bold',
            boxSizing: 'border-box',
          }}
        >
          Upgrade to Premium
        </Button>
      )}
    </Container>
  </Body>
</Html>
```

---

## Notification with Code Block

```astro
---
// emails/DeploymentNotification.astro
import { Html, Head, Body, Container, Preview, Heading, Text, CodeBlock, dracula } from '@backstro/email';

interface Props {
  projectName: string;
  environment: string;
  commitMessage: string;
  deployLog: string;
  success: boolean;
}

const { projectName, environment, commitMessage, deployLog, success } = Astro.props;
---

<Html lang="en">
  <Head />
  <Body style={{ backgroundColor: '#0d1117', fontFamily: 'monospace' }}>
    <Preview>{success ? '✅' : '❌'} Deployment to {environment} – {projectName}</Preview>
    <Container style={{ backgroundColor: '#161b22', margin: '40px auto', padding: '24px', maxWidth: '600px', borderRadius: '8px' }}>
      <Heading as="h1" style={{ fontSize: '18px', color: success ? '#3fb950' : '#f85149', margin: '0 0 4px' }}>
        {success ? '✅ Deployment Successful' : '❌ Deployment Failed'}
      </Heading>
      <Text style={{ fontSize: '13px', color: '#8b949e', margin: '0 0 20px' }}>
        {projectName} → {environment}
      </Text>
      <Text style={{ fontSize: '13px', color: '#c9d1d9', margin: '0 0 16px' }}>
        <strong>Commit:</strong> {commitMessage}
      </Text>
      <CodeBlock
        code={deployLog}
        language="bash"
        theme={dracula}
      />
    </Container>
  </Body>
</Html>
```

---

## Multi-Column Layout

```astro
---
// emails/Newsletter.astro
import { Html, Head, Body, Container, Section, Row, Column, Preview, Heading, Text, Img, Link } from '@backstro/email';

interface Article {
  title: string;
  excerpt: string;
  url: string;
  imageUrl: string;
}

interface Props {
  articles: Article[];
}

const { articles } = Astro.props;

// Split into pairs for two-column layout
const rows: Article[][] = [];
for (let i = 0; i < articles.length; i += 2) {
  rows.push(articles.slice(i, i + 2));
}
---

<Html lang="en">
  <Head />
  <Body style={{ backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
    <Preview>This week's top articles</Preview>
    <Container style={{ backgroundColor: '#ffffff', margin: '40px auto', padding: '24px', maxWidth: '600px', borderRadius: '8px' }}>
      <Heading as="h1" style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: '0 0 24px' }}>
        Weekly Digest
      </Heading>

      {rows.map((pair) => (
        <Row style={{ marginBottom: '24px' }}>
          {pair.map((article) => (
            <Column style={{ width: '50%', paddingRight: '12px', verticalAlign: 'top' }}>
              <Img
                src={article.imageUrl}
                alt={article.title}
                width="240"
                height="140"
                style={{ display: 'block', width: '100%', borderRadius: '4px', marginBottom: '8px' }}
              />
              <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', margin: '0 0 6px' }}>
                {article.title}
              </Text>
              <Text style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px', lineHeight: '20px' }}>
                {article.excerpt}
              </Text>
              <Link href={article.url} style={{ fontSize: '13px', color: '#0070f3', textDecoration: 'none' }}>
                Read more →
              </Link>
            </Column>
          ))}
        </Row>
      ))}
    </Container>
  </Body>
</Html>
```

---

## Custom Font

```astro
---
import { Html, Head, Body, Container, Font, Heading, Text } from '@backstro/email';
---

<Html lang="en">
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
  <Body style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f3f4f6' }}>
    <Container style={{ backgroundColor: '#ffffff', padding: '24px', maxWidth: '560px', margin: '40px auto', borderRadius: '8px' }}>
      <Heading as="h1" style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 16px' }}>
        Custom Font Email
      </Heading>
      <Text style={{ fontSize: '14px', lineHeight: '24px', color: '#374151', margin: '0' }}>
        This email uses Inter, with sans-serif fallback for clients that don't support custom fonts.
      </Text>
    </Container>
  </Body>
</Html>
```
