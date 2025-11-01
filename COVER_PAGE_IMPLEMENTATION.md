# Cover Page Implementation

## Overview
This implementation creates a pixel-perfect cover page for travel proposals that matches the provided screenshot exactly, with Deyor branding and print-optimized styling.

## Files Created
- `app/proposals/demo/print-preview/page.tsx` - Main cover page component
- `app/api/proposals/generate-pdf/route.ts` - PDF generation endpoint
- `app/globals.css` - Updated with Deyor brand colors

## Brand Colors
- Primary Red: `#E63946` (Deyor red for highlights, totals, badges)
- Title Blue: `#2E9AD6` (for main headlines like "Maldives")
- Muted Card: `#EAF6FB` (soft blue background for curator card)
- Gradient: `#4CA8F5` → `#2E8CE0` (promo banner gradient)

## Key Features
- **Print-First Design**: Optimized for A4 PDF generation with Puppeteer
- **Pixel-Perfect Layout**: Matches screenshot spacing, typography, and alignment
- **Deyor Branding**: All MakeMyTrip references replaced with Deyor
- **Responsive**: Works on desktop and mobile preview
- **Accessibility**: Semantic HTML with proper ARIA labels
- **Debug Mode**: Toggle with `?debug=true` for layout tuning

## Print Optimization
- A4 page size with 12mm margins
- `avoid-break` classes prevent content splitting
- Print-specific styles for color accuracy
- Font embedding for server-side rendering

## Usage

### Preview
Visit: `https://deyor.local/proposals/demo/print-preview`

### PDF Generation
Call: `https://deyor.local/api/proposals/generate-pdf?id=demo`

## Customization

### Logo Path
Update the logo in the header section of `page.tsx`:
```tsx
// Current placeholder
<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
  <span className="text-white font-bold text-sm">D</span>
</div>

// Replace with actual logo
<Image src="/public/images/deyor-logo.png" alt="Deyor" width={48} height={48} />
```

### Spacing Variables
Key spacing values that can be tuned:
- Header margin: `mb-8 print:mb-6`
- Card padding: `p-8`
- Section spacing: `mb-8`
- Grid gap: `gap-8`

### Color Adjustments
Update CSS variables in `globals.css`:
```css
:root {
  --deyor-red: #E63946;
  --deyor-blue: #2E9AD6;
  --deyor-muted: #EAF6FB;
}
```

## Technical Notes
- Uses Playfair Display for headings, Inter for body text
- SVG icons for consistent rendering across print and web
- Puppeteer waits for `window.__pdfReady` flag
- Print styles use `-webkit-print-color-adjust: exact`
- All text remains selectable in final PDF

## Dependencies
- `puppeteer` - PDF generation
- `next/image` - Optimized image handling
- Tailwind CSS - Styling framework

