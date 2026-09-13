# Accessibility & Usability Standards (WCAG 2.1 AA)

**Company:** Logic Intelligence Technologies  
**Compliance Target:** WCAG 2.1 Level AA  

---

## 1. Key Implementations

1. **Route Transition Announcer (`RouteAnnouncer.tsx`)**:
   - Implemented an `aria-live="assertive"` screen reader announcement region.
   - Automatically shifts focus to the primary heading (`<h1>`) upon client-side route transitions, preventing focus from getting lost.

2. **Visible Focus Rings (`:focus-visible`)**:
   - All interactive elements (buttons, links, inputs, dropdown items) feature high-contrast cyan focus indicators (`ring-2 ring-cyan-400 ring-offset-2`).
   - Outlines are suppressed for mouse clicks (`:focus:not(:focus-visible)`) while maintaining clear visual indicators for keyboard navigation.

3. **Accessible Navigation Menus**:
   - **Desktop More Menu:** Supports Escape key dismissal, outside-click detection, and correct `aria-expanded` / `aria-haspopup` attributes.
   - **Mobile Drawer Menu:** Traps focus within drawer when open, prevents background document scrolling (`overflow: hidden`), and provides accessible close buttons (`aria-label="Close menu"`).

4. **Form Accessibility & Labels**:
   - Every input across lead intake, support, login, and profile editing has an associated `<label>` with descriptive text and visible icons.
   - Validation and network error alerts are rendered with semantic icons and high-contrast alert containers.

5. **Image Alternatives**:
   - All corporate, founder, service, and case study images feature descriptive, non-empty `alt` attributes.
   - Founder portrait: `"Vikash Saravanan, Founder and Lead Systems Engineer at Logic Intelligence Technologies."`

6. **Touch Targets**:
   - All buttons and links meet the minimum touch target standard of 44x44 CSS pixels on mobile viewports.
