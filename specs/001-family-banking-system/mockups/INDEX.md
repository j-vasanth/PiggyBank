# PiggyBank Design Mockups Index

## Overview
This directory contains interactive HTML/CSS mockups for all screens in the PiggyBank family banking application.

## Mockup Structure

### Parent Screens (`/parent/`)
1. **01-register-family.html** - Create new family account (User Story 1)
2. **02-parent-login.html** - Parent authentication (User Story 1)
3. **03-parent-dashboard.html** - Main dashboard with all children (User Story 1, 2)
4. **04-add-child.html** - Add new child with avatar and PIN (User Story 1)
5. **05-create-transaction.html** - Deposit/deduction form (User Story 2)
6. **06-transaction-history.html** - View child's transaction history (User Story 2)
7. **07-notifications.html** - View in-app notifications (User Story 3) - TODO
8. **08-pending-requests.html** - Approve/deny child requests (User Story 3) - TODO
9. **09-manage-invitations.html** - Invite co-parents (User Story 4) - TODO

### Child Screens (`/child/`)
1. **01-child-login.html** - Child PIN authentication (User Story 1)
2. **02-child-balance.html** - View balance and history (User Story 1, 2)
3. **03-request-money.html** - Submit credit/expenditure requests (User Story 3)
4. **04-progress-dashboard.html** - Charts and milestones (User Story 5) - TODO

### Shared Resources (`/shared/`)
- **design-system.css** - Complete design system with all tokens and components

## How to Use

### Viewing Mockups
1. Open any HTML file in a web browser
2. All mockups are interactive with working forms and navigation
3. Mock data is included to demonstrate realistic content

### Implementing from Mockups
1. Reference `design-system.css` for exact color codes, spacing, and typography
2. Copy component structures and styles
3. Replace mock data with API calls
4. All CSS custom properties are documented in design-system.css

## Design System Highlights

### Color Palette
- **Parent Theme**: Professional blue/gray (minimal, clean)
- **Child Theme**: Colorful purple/pink/yellow (fun, engaging)

### Key Measurements
- Max width: 1200px (dashboard), 600px (forms)
- Spacing scale: 4px base unit (space-1 through space-20)
- Border radius: 4px-24px (rounded corners throughout)

### Typography
- Font family: System fonts (-apple-system, Segoe UI, etc.)
- Display font: Poppins (headings)
- Font sizes: 12px-48px scale

### Components Available
- Buttons (primary, secondary, success, danger)
- Forms (inputs, selects, textareas)
- Cards (standard, hover effects)
- Badges (status indicators)
- Avatars (sm, md, lg, xl sizes)

## Design Principles

### Parent Interface (Minimal)
- Clean, professional aesthetic
- Fast task completion (FR-026)
- Clear data hierarchy
- Subtle interactions

### Child Interface (Fun & Engaging)
- Bright, welcoming colors
- Large touch targets
- Playful animations
- Age-appropriate design (FR-025)

## Status

**Created**: 6/9 parent screens, 0/4 child screens  
**Design System**: Complete  
**Next**: Complete remaining parent screens, create all child screens
