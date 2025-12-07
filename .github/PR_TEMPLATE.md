# Pull Request

## Description

<!-- Please include a summary of the change and which issue is fixed. Please also include relevant motivation and context. -->

**Problem:**

<!-- What is the issue being addressed? -->

**Solution:**

<!-- How does this PR fix the issue? -->

## Rendering Strategy (for new pages)

<!-- If this PR adds a new page, please explain the chosen rendering strategy (SSG, SSR, or ISR) and why. -->

**Strategy:** [SSG / SSR / ISR]
**Rationale:**

## Type of change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Refactor (code improvement without functionality change)
- [ ] Documentation update

## Checklist

### General

- [ ] My code follows the style guidelines of this project (ESLint + Prettier).
- [ ] I have performed a self-review of my own code.
- [ ] I have commented my code, particularly in hard-to-understand areas.
- [ ] My changes generate no new warnings.

### TypeScript & Validation

- [ ] Code is TypeScript type-safe (no `any` unless absolutely necessary).
- [ ] New API routes use `zod` for schema validation.

### Database & Prisma

- [ ] Database operations use `prisma` client.
- [ ] Transactions are used where necessary (`prisma.$transaction`).

### UI/UX & Accessibility

- [ ] UI components follow Shadcn UI patterns.
- [ ] Tailwind utility classes are used for styling.
- [ ] Accessibility (a11y) is considered (aria attributes, semantic HTML).
- [ ] Responsive design is verified.

### Internationalization (i18n)

- [ ] No hardcoded strings; all text is in `dictionaries/`.

### Performance

- [ ] Server vs Client components are correctly separated.
- [ ] Unnecessary re-renders are avoided.

### Security

- [ ] No secrets or `.env` values are committed.

### Testing

- [ ] I have added tests that prove my fix is effective or that my feature works.
- [ ] New and existing unit tests pass locally with my changes.
- [ ] `npm run lint`, `npm test`, and `npm run build` pass locally.

## Test Steps

<!-- Please describe the tests that you ran to verify your changes. Provide instructions so we can reproduce. -->

1.
2.
3.

## Rollback Notes

<!-- What should be done if this PR needs to be reverted? -->
