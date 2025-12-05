# FinTrack - Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required**: Yes - The app requires user accounts for data persistence and cross-device sync.

**Implementation**:
- Email/password authentication with session persistence
- Include Apple Sign-In for iOS (App Store requirement)
- Add Google Sign-In for cross-platform support
- Auth screens: Login, Register, Forgot Password
- Profile screen with avatar selection, display name, email management
- Account deletion: Settings > Account > Delete Account (double confirmation)
- Privacy policy & terms of service links on auth screens

### Navigation Architecture

**Root Navigation**: Bottom Tab Navigation (5 tabs)
- **Dashboard** (Home icon) - Main overview
- **Transactions** (List icon) - Transaction history
- **Budget** (Target icon) - Budget management
- **Goals** (Star icon) - Savings goals
- **More** (Menu icon) - Settings, Reports, Bills, Accounts, Profile

**Core Action**: Floating Action Button (FAB) for "Add Transaction" - positioned above tab bar, always accessible

**Navigation Stacks**:
- Dashboard Stack: Dashboard → Transaction Details
- Transactions Stack: Transaction List → Add/Edit Transaction → Receipt Viewer
- Budget Stack: Budget Overview → Category Budget Details → Edit Budget
- Goals Stack: Goals List → Goal Details → Add/Edit Goal → Make Contribution
- More Stack: More Menu → Settings/Reports/Bills/Accounts/Profile → respective detail screens

**Modal Screens**:
- Add/Edit Transaction (full-screen modal from FAB)
- Camera/Receipt Scanner
- Budget Alert Dialogs
- Delete Confirmations

## Screen Specifications

### 1. Dashboard (Tab 1)
**Purpose**: Financial overview at a glance

**Layout**:
- Header: Custom, transparent
  - Left: User avatar (touchable → Profile)
  - Title: "FinTrack" or month name
  - Right: Notification bell icon
- Main Content: ScrollView
  - Safe Area Top: headerHeight + Spacing.xl
  - Safe Area Bottom: tabBarHeight + Spacing.xl
- Floating FAB: Add Transaction button
  - Position: Bottom right, tabBarHeight + 16px from bottom
  - Shadow: width 0, height 2, opacity 0.10, radius 2

**Components**:
- Balance card (gradient background, large typography)
- Income/Expense summary row (two cards side-by-side)
- Pie chart: Monthly spending by category
- Line chart: Weekly spending trend
- Recent transactions list (3-5 items, "View All" button)
- Upcoming bills reminder card (if any due within 7 days)
- Savings goals progress (horizontal scroll, circular progress)

### 2. Transaction List (Tab 2)
**Purpose**: View and manage all transactions

**Layout**:
- Header: Default navigation header
  - Title: "Transactions"
  - Right: Filter icon, Search icon
- Main Content: FlatList with pull-to-refresh
  - Safe Area Top: Spacing.xl
  - Safe Area Bottom: tabBarHeight + Spacing.xl
- Floating Search Bar: Appears when search icon tapped

**Components**:
- Date range selector (sticky header)
- Category filter chips (horizontal scroll)
- Transaction items (swipe-to-delete)
  - Group by date
  - Show category icon, amount (green/red), description
- Empty state: Illustration + "No transactions yet"

### 3. Add/Edit Transaction (Modal)
**Purpose**: Record income or expense

**Layout**:
- Header: Custom modal header
  - Left: Cancel button
  - Title: "Add Transaction" / "Edit Transaction"
  - Right: Save button (disabled until valid)
- Main Content: ScrollableForm
  - Safe Area Top: Spacing.xl
  - Safe Area Bottom: insets.bottom + Spacing.xl

**Components**:
- Transaction type toggle (Income/Expense) - prominent, color-coded
- Amount input (large, number keyboard)
- Category picker (grid of icons with labels)
- Date/Time picker
- Account selector
- Notes text area
- Receipt attachment button (camera icon)
- Recurring transaction toggle

### 4. Budget Overview (Tab 3)
**Purpose**: Monitor spending against budgets

**Layout**:
- Header: Default navigation header
  - Title: "Budget"
  - Right: Edit icon
- Main Content: ScrollView
  - Safe Area Top: Spacing.xl
  - Safe Area Bottom: tabBarHeight + Spacing.xl

**Components**:
- Month selector (with arrows)
- Total budget vs actual spending card
- Category budget cards:
  - Progress bar with color coding (green <70%, yellow 70-90%, red >90%)
  - Spent amount / Budget amount
  - Percentage indicator
- "Set Monthly Budget" button if none exists

### 5. Goals List (Tab 4)
**Purpose**: Track savings goals

**Layout**:
- Header: Default navigation header
  - Title: "Savings Goals"
  - Right: Add icon
- Main Content: FlatList or ScrollView
  - Safe Area Top: Spacing.xl
  - Safe Area Bottom: tabBarHeight + Spacing.xl

**Components**:
- Goal cards (stacked vertically):
  - Goal name and icon
  - Circular progress indicator (percentage)
  - Current amount / Target amount
  - Days remaining
  - "Add Contribution" button
- Empty state: "Set Your First Goal" illustration
- Completed goals section (collapsible)

### 6. More Menu (Tab 5)
**Purpose**: Access settings and secondary features

**Layout**:
- Header: Default navigation header
  - Title: "More"
- Main Content: ScrollView
  - Safe Area Top: Spacing.xl
  - Safe Area Bottom: tabBarHeight + Spacing.xl

**Components**:
- Profile section (avatar, name, email)
- Menu items grouped:
  - Accounts & Cards
  - Bills & Reminders
  - Reports & Analytics
  - Settings
  - Help & Support
  - About FinTrack
- Log Out button (destructive style)

### 7. Reports & Analytics
**Purpose**: Detailed financial insights

**Layout**:
- Header: Default navigation header
  - Title: "Reports"
  - Right: Export icon (PDF/CSV)
- Main Content: ScrollView
  - Safe Area Top: Spacing.xl
  - Safe Area Bottom: insets.bottom + Spacing.xl

**Components**:
- Time period selector (Month/Year)
- Income vs Expense comparison (bar chart)
- Category breakdown (pie chart with legend)
- Trend analysis (line chart)
- Top spending categories list
- Insights card ("You spent 20% more on dining this month")

## Design System

### Color Palette
**Primary Colors**:
- Income Green: #4CAF50
- Expense Red: #F44336
- Primary Brand: #2196F3 (blue for neutral actions)

**Semantic Colors**:
- Success: #4CAF50
- Warning: #FFC107 (budget alert 70-90%)
- Danger: #F44336 (budget over 90%)
- Info: #2196F3

**Light Theme**:
- Background: #FFFFFF
- Surface: #F5F5F5
- Text Primary: #212121
- Text Secondary: #757575
- Border: #E0E0E0

**Dark Theme**:
- Background: #121212
- Surface: #1E1E1E
- Text Primary: #FFFFFF
- Text Secondary: #B0B0B0
- Border: #2C2C2C

### Typography
- Headings: Bold, 24-32px
- Body: Regular, 14-16px
- Amounts: Semi-bold/Bold, 18-28px (larger for dashboard balance)
- Labels: Medium, 12-14px

### Visual Design
**Icons**: Use Feather icons from @expo/vector-icons for consistency
- Category icons: Food, Transport, Shopping, Bills, Entertainment, Healthcare, Education
- Navigation icons: Standard system icons
- Action icons: Plus, Edit, Delete, Filter, Search

**Charts**:
- Pie charts: Use vibrant category colors
- Line charts: Green for income, red for expenses
- Bar charts: Side-by-side comparison with legend
- Progress bars: Horizontal, rounded corners, color-coded

**Cards**:
- Border radius: 12px
- Padding: 16px
- Shadow: Subtle elevation for floating cards
- Background: Surface color

**Buttons**:
- Primary: Filled, brand color
- Secondary: Outlined
- Destructive: Red filled
- Floating Action Button: Circular, primary color with shadow (width 0, height 2, opacity 0.10, radius 2)

**Touchable Feedback**:
- Opacity change (0.7) for most touchables
- Ripple effect on Android
- Scale animation (0.95) for cards

**Animations**:
- Loading skeletons for data fetching
- Smooth transitions between screens
- Chart animations on mount
- Celebration animation for goal completion

### Required Assets
**User Avatars** (8 preset options):
- Financial themed: Piggy bank, Dollar sign, Wallet, Credit card, Coin stack, Safe, Chart up, Handshake
- Style: Flat, circular, colorful icons on gradient backgrounds

**Empty State Illustrations**:
- No transactions: Empty wallet illustration
- No budgets: Target with arrow illustration
- No goals: Mountain/flag illustration
- No bills: Calendar illustration

**Category Icons** (generate 8):
- Food & Dining, Transportation, Shopping, Bills & Utilities, Entertainment, Healthcare, Education, Other

### Accessibility
- Minimum touch target: 44x44 points
- Color contrast: WCAG AA compliant (4.5:1 for text)
- Screen reader labels for all interactive elements
- Amount colors also use icons (up/down arrows) for colorblind users
- Font scaling support
- Haptic feedback for important actions