# Backstro Email Agent Skill

This directory contains an Agent Skill for building HTML emails with Astro components using the `@backstro/email` library.

## Structure

```
astro/skills/backstro-email/
├── SKILL.md              # Main skill instructions
├── TESTS.md              # Skill compliance tests
└── references/
    ├── COMPONENTS.md     # Complete component reference
    ├── STYLING.md        # Styling guide (inline styles + Tailwind)
    ├── PATTERNS.md       # Common email patterns and examples
    ├── SENDING.md        # Email sending guide
    └── I18N.md           # Internationalization guide
```

## What is an Agent Skill?

Agent Skills are a standardized format for giving AI agents specialized knowledge and workflows. This skill teaches agents how to:

- Build HTML email templates using Astro components
- Use conditionals and loops natively in `.astro` templates
- Send emails through Resend and other providers
- Inline Tailwind CSS for email clients
- Deploy rendering to Cloudflare Workers with `nodejs_compat`
- Follow email development best practices for cross-client compatibility

## Using This Skill

AI agents can load this skill to gain expertise in backstro-email development. The skill follows the [Agent Skills specification](https://agentskills.io) with:

- **SKILL.md**: Core instructions loaded when the skill is activated (< 350 lines)
- **references/**: Detailed documentation loaded on-demand for specific topics

## Progressive Disclosure

The skill is structured for efficient context usage:

1. **Metadata** (~100 tokens): Name and description in frontmatter
2. **Core Instructions** (~3K tokens): Main SKILL.md content
3. **Detailed References** (as needed): Component docs, styling, patterns

Agents load only what they need for each task.

## Key Differences From React Email

|                    | React Email               | Backstro Email                    |
| ------------------ | ------------------------- | --------------------------------- |
| File format        | `.tsx`                    | `.astro`                          |
| Package            | `@react-email/components` | `@backstro/email`                 |
| Props              | Function parameters       | `Astro.props`                     |
| Tailwind           | `<Tailwind>` wrapper      | `inlineTailwind()` post-processor |
| Rendering          | `render(<Component />)`   | `render(Component, props)`        |
| Env vars           | `process.env`             | `import.meta.env`                 |
| Preview props      | `.PreviewProps`           | Props passed at render time       |
| Loops/conditionals | JSX expressions           | Astro template expressions        |

## Learn More

- [Astro Documentation](https://docs.astro.build)
- [Email Client CSS Support](https://www.caniemail.com)
- [Resend Documentation](https://resend.com/docs/llms.txt)
