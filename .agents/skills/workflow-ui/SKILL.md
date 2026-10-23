---
name: workflow-ui
description: Design rules for the Workflow employee management app. Use this skill whenever creating or changing any screen, page, component, form, table, dialog, layout, sidebar, chat widget or styling in the frontend, even for small tweaks, so the UI stays modern, simple, consistent and does not look AI-generated. Read it before writing any frontend UI code.
---

# Workflow UI

Direction: **calm, modern, simple.** Think of a well-made internal tool: clear hierarchy, plenty of space, thin borders, one accent color, almost no decoration. People should find things quickly and trust what they see. It should not look flashy, and it should not look like a bare template either.

The one memorable element is the **accent color used sparingly on a neutral canvas** (primary buttons, active nav item, links, focus rings). Everything else stays quiet.

## 1. Design tokens

Put these in `src/index.css` as CSS variables and map them in the Tailwind/shadcn theme. Do not hardcode hex values in components. Use the tokens.

```css
:root {
  --background: #F7F8FA;        /* app canvas, cool off-white */
  --surface: #FFFFFF;           /* cards, tables, dialogs, sidebar */
  --border: #E3E6EB;
  --foreground: #151922;        /* main text (not pure black) */
  --muted-foreground: #5F6B7A;  /* secondary text */
  --muted: #EEF0F3;             /* subtle fills, table header, hover */

  --accent: #0F766E;            /* deep teal: primary actions, active nav, links */
  --accent-hover: #0B5F59;
  --accent-soft: #E6F4F2;       /* selected rows, user chat bubble, soft highlights */
  --accent-foreground: #FFFFFF;

  --success: #15803D;  --success-soft: #E8F5EC;
  --warning: #B45309;  --warning-soft: #FDF3E3;
  --danger:  #B42318;  --danger-soft:  #FDECEA;

  --radius-control: 8px;   /* buttons, inputs, selects */
  --radius-panel: 12px;    /* cards, tables, dialogs */
}
```

Rules:
- One accent only. Do not introduce purple, blue gradients, indigo or neon colors.
- No gradients anywhere. No colored glows. No glassmorphism or blur.
- Use `--success`, `--warning`, `--danger` only for status meaning, never as decoration.
- Light theme only for now. Do not build dark mode unless asked.

## 2. Typography

- Font: **Geist Sans** (`@fontsource-variable/geist`). Fallback: `system-ui, sans-serif`. One family for everything.
- Base text 14px. Scale: 12 (captions, badges), 13 (table cells, helper text), 14 (body, inputs), 16 (card titles), 20 (page titles), 28 (rare, auth pages only).
- Weights: 400 body, 500 labels and nav, 600 titles. No bold walls of text.
- Line height about 1.5 for body, 1.3 for titles. Keep text blocks under 70 characters wide.
- Sentence case everywhere ("Add employee", not "Add Employee" or "ADD EMPLOYEE").
- Do not use all caps labels, tracked-out eyebrow text above headings, or a single highlighted word inside a headline.
- Numbers in tables and balances use `tabular-nums`.

## 3. Layout

- **App shell:** fixed left sidebar (232px, white surface, 1px right border) + top bar (56px, 1px bottom border) + scrolling content area on `--background`.
- Content max width 1080px, padding 24px (mobile 16px), centered within the content area.
- Sidebar: logo/name at the top, nav items (icon 16px + label, 36px tall, 8px radius), active item uses `--accent-soft` background and `--accent` text. The user menu (name, role, logout) sits at the bottom or in the top bar. On mobile the sidebar becomes a slide-over drawer.
- Nav per role: Owner (Dashboard, Employees, Leave, Announcements, Policy, Company, Profile), HR (Dashboard, Employees, Leave, Announcements, Profile), Employee (Dashboard, Leave, Announcements, Profile).
- **Page header pattern:** title (20px, 600) with a one-line description below on the left, the primary action button on the right. Then content. Every page starts like this.
- Spacing uses a 4px scale. Common gaps: 8, 12, 16, 24, 32. Be generous with whitespace.
- Forms: single column, max width 560px, label above input, helper or error text below. Group long forms with a heading and a divider, not a box around each group.
- Lists of records (employees, leaves, announcements) are **tables or simple rows with dividers**, not grids of identical cards. Cards are for summaries only.
- Dashboard: a short greeting line, then at most 3 or 4 summary tiles relevant to the role (for example leave balance, pending approvals, latest announcement). Nothing fancy.

## 4. Components

Build on shadcn/ui, then restyle through the tokens above. Never ship the default look unchanged.

- **Panels and cards:** white surface, 1px `--border`, 12px radius, **no shadow**. Padding 20 to 24px. Do not nest a card inside a card.
- **Shadows:** only on floating layers (dialog, dropdown, chat panel): one soft shadow, `0 8px 24px rgba(16, 24, 40, 0.10)`.
- **Buttons:** 36px tall, 8px radius, 14px/500 text. Primary = accent fill. Secondary = white with border. Ghost for low-priority actions. Destructive = `--danger` text on white, fill only inside confirm dialogs. One primary button per view. No arrows or emoji in labels. Loading state shows a small spinner and disables the button.
- **Inputs:** 36px tall, 1px border, 8px radius, visible focus ring in `--accent` (2px). Error state uses a `--danger` border and a message below.
- **Tables:** header row on `--muted` with 12px/500 muted text (sentence case), 13px cells, 48px rows, 1px row dividers, subtle row hover on `--muted`. Row actions on the right in a "more" menu or one ghost button. Wide tables scroll horizontally inside their container. Add pagination or a "load more" for long lists.
- **Status badges:** small pill, 12px/500, soft background + matching text. Pending = warning, Approved = success, Rejected = danger, Active = success, Inactive = neutral (`--muted`). Role badges (Owner, HR, Employee) are neutral.
- **Dialogs:** centered, 12px radius, max width 480px, title + short description, actions right-aligned (secondary then primary). The forced change-password dialog has no close button and cannot be dismissed.
- **Toasts:** bottom-right, short messages, same wording as the action ("Leave request sent").
- **Avatars:** circle with initials on `--accent-soft`. No stock photos.
- **Icons:** `lucide-react`, 16px (20px max), stroke 1.75, color inherits text. Icons support a label, they do not replace it.

## 5. Required states

Every screen with data must have:
- **Loading:** skeleton rows or blocks matching the layout (no spinners filling the whole page).
- **Empty:** a short sentence that says what belongs here and the action to add it. Example: "No leave requests yet. Apply for leave when you need time off." with one button.
- **Error:** plain message saying what failed and a "Try again" button.

## 6. Policy chat widget

- Floating button: 52px circle, bottom-right (24px offset), accent fill, chat icon, small shadow allowed.
- Panel: opens above the button, 380px wide by 540px tall on desktop (full screen on mobile), white surface, 12px radius, floating shadow. Open and close with a quick 150 to 200ms fade and slight rise. Nothing else animates.
- Header: "Policy assistant" with a short subtitle "Answers come from your company policy", and a close button.
- Messages: user bubbles on `--accent-soft`, assistant bubbles white with border. 14px text. Auto-scroll to the latest message. Show a simple three-dot typing indicator while waiting.
- Empty state: two or three example questions as clickable chips ("How many sick leaves do I get?").
- If no policy PDF is uploaded, show: "Your company has not uploaded a policy yet." (and for the owner, a link to the Policy page).
- Input at the bottom with a send button. Enter sends, Shift+Enter adds a new line.

## 7. Motion

- Hover and focus transitions: 150ms on color, background and border only.
- Dialogs and the chat panel: short fade with a tiny scale or translate.
- **No** page-load animations, no staggered list reveals, no hover lift on cards, no parallax, no bouncing or pulsing elements.
- Respect `prefers-reduced-motion`.

## 8. Writing the interface text

- Plain words, active voice, sentence case. Buttons say what happens: "Save changes", "Add employee", "Approve", "Reject".
- Use the same word for an action everywhere (the "Approve" button produces the "Leave approved" toast).
- Errors say what went wrong and how to fix it, without apologizing: "Password must be at least 8 characters."
- Do not write marketing slogans, filler subtitles or joke copy. Do not use emoji.
- Roles are called Owner, HR and Employee. Statuses are Pending, Approved, Rejected, Active, Inactive.

## 9. Things that make UI look AI-generated (avoid)

- Gradient buttons, gradient text, glowing borders, blurred blobs in the background
- The same rounded card with the same shadow repeated everywhere
- Emoji used as icons, or emoji in headings
- Eyebrow labels in all caps above every heading
- Purple/indigo as the main color
- Hero sections with big centered text on app pages
- Fade-and-slide-up animation on every section
- Generic placeholder copy ("Streamline your workflow today")
- Dense walls of tiny gray text, or giant empty areas with a single tiny item

## 10. Accessibility and responsiveness

- Text contrast at least 4.5:1. Visible keyboard focus on every interactive element.
- Every input has a label. Icon-only buttons have an `aria-label`.
- Layouts work from 360px wide. Tables scroll inside their container. Tap targets at least 36px.

## 11. Before you finish any screen

1. Does it use only the tokens (no stray colors, no new fonts)?
2. Does it have the page header pattern and loading, empty and error states?
3. Is there only one primary button, and is all text in sentence case?
4. Did you avoid everything in section 9?
5. Is the component file under about 200 lines, with feature pieces split into their own components?
