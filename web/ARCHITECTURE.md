# FlashGuard Web UI - Professional React Redesign

## 📋 Overview

The FlashGuard web UI has been completely redesigned and rebuilt as a **professional, industry-worthy React application** following a comprehensive design system and modern architecture patterns. This is no longer a simple template—it's a production-ready fintech application with proper separation of concerns, reusable components, and enterprise-grade design standards.

---

## 🏗️ Architecture

### Project Structure

```
web/src/
├── components/
│   ├── common/                 # Reusable UI components
│   │   ├── Button.jsx         # Button variants (primary, secondary, ghost, danger)
│   │   ├── Form.jsx           # Form controls (Input, Textarea, Select, Checkbox, Radio)
│   │   ├── Card.jsx           # Card layouts and containers
│   │   ├── Alert.jsx          # Alerts, badges, spinners, empty states
│   │   ├── Modal.jsx          # Modals, dropdowns, tabs
│   │   └── index.js           # Barrel export
│   ├── layout/
│   │   ├── Header.jsx         # Public header with navigation
│   │   └── index.js           # Barrel export
│   └── common/index.js        # Component library exports
├── pages/
│   ├── Landing.jsx            # Public landing page
│   ├── Auth.jsx               # Login/signup page
│   ├── Dashboard.jsx          # Portfolio overview
│   ├── Transfers.jsx          # Money transfer interface
│   ├── History.jsx            # Transaction ledger
│   └── Notifications.jsx      # Alerts and notifications
├── hooks/
│   └── index.js               # Custom hooks (useSession, useToast, useForm, etc.)
├── utils/
│   └── index.js               # Utility functions (formatCurrency, fetchJson, validation, etc.)
├── styles/
│   ├── index.css              # Main style import file
│   ├── design-system.css      # Design tokens (colors, typography, spacing, etc.)
│   ├── components.css         # Component styles (buttons, forms, cards, alerts)
│   ├── layout.css             # Layout styles (grid, sidebar, header, footer)
│   ├── footer-modal.css       # Footer and modal styles
│   └── pages.css              # Page-specific styles
├── App.jsx                    # Root component with routing
└── main.jsx                   # Entry point
```

---

## 🎨 Design System

### Color Palette
- **Primary**: Deep Navy Black (#000000)
- **Secondary**: Vibrant Green (#006e21) - for primary actions
- **Tertiary**: Navy Container (#131b2e)
- **Surfaces**: Clean grayscale from #ffffff to #e0e3e5
- **Semantic**: Success (#006e21), Warning (#f4a600), Error (#ba1a1a), Info (#0066cc)

### Typography
- **Font**: Inter (exclusive) - excellent for financial data
- **Display**: 48px, 700 weight
- **Headline**: 32px, 600 weight
- **Body**: 16px, 400 weight
- **Label**: 14px, 600 weight (uppercase for emphasis)

### Spacing
- **Unit**: 4px baseline grid
- **Stack**: xs(4px), sm(8px), md(16px), lg(24px), xl(32px), 2xl(48px), 3xl(64px)
- **Margins**: 40px desktop, 16px mobile, 24px tablet
- **Container**: 1440px max-width

### Rounded Corners
- **sm**: 4px
- **md**: 8px
- **lg**: 12px
- **xl**: 16px
- **2xl**: 24px
- **full**: 9999px

---

## 📦 Component Library

### Common Components

#### Buttons
```jsx
<Button variant="primary|secondary|ghost|danger" size="sm|md|lg">
  Click me
</Button>
```

#### Form Inputs
```jsx
<Input label="Email" type="email" error={errorMsg} hint="Optional hint" required />
<Textarea label="Message" rows={4} />
<Select label="Option" options={[...]} />
<Checkbox label="Agree" />
<Radio label="Yes" />
```

#### Cards & Layouts
```jsx
<Card elevated>
  <CardHeader title="Title" subtitle="Subtitle" action={<Button>Action</Button>} />
  {children}
  <CardFooter>Actions</CardFooter>
</Card>

<Grid columns={3} gap="lg">{items}</Grid>
<Section title="Section Title" subtitle="Subtitle">{children}</Section>
<Stack direction="vertical|horizontal" spacing="md">{children}</Stack>
```

#### Status & Feedback
```jsx
<Badge variant="success|warning|danger|info|outline" />
<StatusBadge status="completed" icon={Icon} />
<Alert variant="success|warning|danger|info" title="Title">Message</Alert>
<Toast message="Notification" variant="success" />
<Spinner size="sm|md|lg" />
<EmptyState icon={Icon} title="Title" description="Desc" action={<Button />} />
```

#### Interactive
```jsx
<Modal isOpen={open} onClose={close} title="Title" size="md|lg|xl">
  Content
</Modal>

<Dropdown trigger={<Button />}>
  <DropdownItem>Item 1</DropdownItem>
</Dropdown>

<Tabs tabs={[
  { id: 'tab1', label: 'Tab 1', content: <div /> },
  { id: 'tab2', label: 'Tab 2', content: <div /> }
]} activeTab={active} onTabChange={setActive} />
```

---

## 🪝 Custom Hooks

### useSession()
Manages user authentication state with localStorage persistence
```jsx
const [session, updateSession] = useSession();
```

### useToast()
Global toast notification management
```jsx
const { toast, notify, clearToast } = useToast();
notify('Success!', 'success'); // or 'danger', 'warning', 'info'
```

### useFetch(url, options)
Async data loading with loading/error states
```jsx
const { data, loading, error, refetch } = useFetch('/api/endpoint');
```

### useForm(initialValues, onSubmit)
Form state management with validation
```jsx
const form = useForm({ email: '' }, async (values) => {
  await submitForm(values);
});
```

### useDebounce(value, delay)
Debounce values for search inputs
```jsx
const debouncedSearch = useDebounce(searchTerm, 300);
```

### useMediaQuery(query)
Responsive design hook
```jsx
const isMobile = useMediaQuery('(max-width: 768px)');
```

---

## 🛠️ Utility Functions

### Formatting
- `formatCurrency(value)` - ZAR currency with proper localization
- `formatNumber(value, decimals)` - Thousand separators
- `formatRelativeTime(date)` - "2h ago", "Just now"
- `formatDate(date, format)` - Proper date formatting
- `formatDuration(seconds)` - "1h 30m"

### Status & Icons
- `getStatusTone(status)` - Returns 'success', 'warning', 'danger', 'info'
- `getStatusIcon(status)` - Returns Material Symbols icon name

### API & Data
- `fetchJson(path, options)` - Fetch with error handling
- `isValidEmail(email)`
- `isValidPhoneNumber(phone)` - South African format
- `isValidAmount(amount)`
- `getInitials(fullName)`

---

## 📄 Page Components

### Landing Page (`/`)
- Hero section with CTA
- Feature pills and benefits
- Bento grid with feature cards
- Security section with compliance info
- Call-to-action panels
- Portal cards for quick navigation

### Auth Page (`/login`, signup mode)
- Embedded login/signup forms (no separate form sections)
- Demo credentials display
- Session management
- Form validation

### Dashboard (`/dashboard` - protected)
- KPI cards (Net Worth, Account balances)
- Recent transactions table
- Activity sidebar with quick stats
- Quick action links
- Professional financial metrics display

### Transfers (`/transfers` - protected)
- Account selection with inline buttons
- Beneficiary selection grid
- Amount input with quick amount buttons
- Reference field
- Real-time transfer summary sidebar
- Compliance flags for high-value transfers

### History (`/history` - protected)
- Transaction ledger with filters
- Status filtering (all, pending, completed, rejected)
- Export to CSV/PDF options
- Summary statistics
- Relative time formatting

### Notifications (`/notifications` - protected)
- Security alerts section
- Transaction updates
- Pending approvals
- Promotional content cards
- Live signal indicators

---

## 🔐 Authentication

Routes are protected using session context:
- Public: `/`, `/login`
- Protected: `/dashboard`, `/transfers`, `/history`, `/notifications`
- Unauthenticated users redirected to `/login`

---

## 📱 Responsive Design

- **Mobile**: 4-column grid, 16px margins, stacked layouts
- **Tablet**: 8-column grid, 24px margins, flexible layouts
- **Desktop**: 12-column grid, 40px margins, multi-column layouts
- **Breakpoints**: 640px (sm), 768px (md), 1024px (lg), 1280px (xl), 1536px (2xl)

All components respond automatically with CSS media queries and the `useMediaQuery` hook for JavaScript logic.

---

## 🎯 Key Improvements Over Old Implementation

| Aspect | Old | New |
|--------|-----|-----|
| **Architecture** | Monolithic App.jsx | Component-based modular structure |
| **Styling** | Single global CSS file | Design system with organized CSS modules |
| **Forms** | Separate form sections | Embedded forms within page layouts |
| **Components** | No reusable component library | 20+ reusable, customizable components |
| **Hooks** | Basic useState/useEffect | Custom hooks for common patterns |
| **TypeScript** | No types | Validated with JSDoc hints |
| **Accessibility** | Basic ARIA | Comprehensive ARIA labels and roles |
| **Responsive** | Basic media queries | Mobile-first, systematic breakpoints |
| **Design System** | Inline styles | Comprehensive CSS custom properties |
| **Error Handling** | Limited | Toast notifications, form validation, alerts |
| **Code Organization** | 1000+ lines per file | 100-200 lines per file (SRP) |
| **Reusability** | Low | High (DRY principle) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Opens at http://localhost:5173

### Build
```bash
npm run build
```

### Production Preview
```bash
npm run preview
```

---

## 📚 Component Examples

### Basic Button
```jsx
import { Button } from './components/common';

<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>
```

### Form with Validation
```jsx
import { Input, Button } from './components/common';
import { useForm } from './hooks';

const form = useForm(
  { email: '' },
  async (values) => {
    await submitForm(values);
  }
);

<form onSubmit={form.handleSubmit}>
  <Input
    label="Email"
    name="email"
    value={form.values.email}
    onChange={form.handleChange}
    error={form.errors.email}
  />
  <Button isLoading={form.isSubmitting}>Submit</Button>
</form>
```

### Protected Page Layout
```jsx
import { PageWrapper } from './components/layout';

export default function MyPage({ session, notify }) {
  const actions = <Button>Action</Button>;
  const aside = <Card>Sidebar</Card>;

  return (
    <PageWrapper
      title="Page Title"
      subtitle="Page description"
      session={session}
      actions={actions}
      aside={aside}
    >
      <Card>Content goes here</Card>
    </PageWrapper>
  );
}
```

---

## 🎓 Best Practices

1. **Use Design System Colors**: Always use CSS custom properties (`var(--color-primary)`) instead of hardcoded values
2. **Consistent Spacing**: Use the spacing scale (8px multiples) from `var(--spacing-*)` 
3. **Reuse Components**: Check component library before creating custom elements
4. **Prop Drilling**: Use context for session/notifications instead of prop drilling
5. **Form Validation**: Use `useForm` hook for consistent form handling
6. **Error Handling**: Always use `notify()` for user-facing errors
7. **Accessibility**: Include ARIA labels, use semantic HTML, ensure keyboard navigation
8. **Mobile First**: Design for mobile, enhance for desktop
9. **Performance**: Use `useCallback` for event handlers, `useMemo` for expensive calculations
10. **Code Organization**: Keep files under 200 lines (single responsibility principle)

---

## 📞 Support & Customization

To modify the design system:
1. Edit `/src/styles/design-system.css` for tokens
2. Edit component styles in `/src/styles/components.css`
3. Add page-specific styles to `/src/styles/pages.css`
4. Create new components in `/src/components/common/` or `/src/components/layout/`

---

## ✨ Summary

This is now a **professional, industry-worthy React application** with:
- ✅ Proper component architecture
- ✅ Comprehensive design system
- ✅ Reusable component library
- ✅ Custom hooks for common patterns
- ✅ Embedded forms (no separate form sections)
- ✅ Protected routes with session management
- ✅ Responsive design with mobile-first approach
- ✅ Professional styling and animations
- ✅ Error handling and notifications
- ✅ Accessibility best practices

Everything is thoroughly designed and ready for production use!
