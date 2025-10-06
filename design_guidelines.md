# Rai Aura Jewellery Website - Design Guidelines

## Design Approach: Reference-Based (Luxury E-commerce)
Drawing inspiration from premium jewellery brands like Mejuri, Catbird, and luxury e-commerce sites like NET-A-PORTER for sophisticated product presentation and elegant user experience.

## Core Design Principles
- **Premium Elegance**: Sophisticated, luxurious aesthetic befitting fine jewellery
- **Visual Hierarchy**: Large imagery with refined typography
- **Breathing Space**: Generous whitespace for premium feel
- **Tactile Quality**: Warm, inviting color palette with metallic accents

## Color Palette

### Primary Colors
- **Beige Background**: 30 25% 92% (soft, warm neutral base)
- **Mocha Brown**: 25 20% 35% (rich, grounding text color)
- **Rose Gold Accent**: 15 65% 70% (metallic highlight, buttons, icons)

### Supporting Colors
- **Cream White**: 40 30% 97% (cards, elevated surfaces)
- **Deep Mocha**: 25 25% 20% (headings, emphasis)
- **Soft Rose**: 15 45% 85% (hover states, subtle highlights)
- **Warm Gray**: 30 10% 60% (secondary text, borders)

### Dark Mode (Optional Future Enhancement)
- Background: 25 15% 12%
- Text: 30 20% 90%
- Accents maintain rose gold warmth

## Typography

### Font Families
- **Headings**: Cormorant Garamond (serif, elegant, luxurious)
- **Body**: Montserrat (sans-serif, clean, readable)
- **Accents**: Bodoni Moda (for special callouts, prices)

### Type Scale
- **Hero Heading**: text-6xl md:text-7xl lg:text-8xl, font-light, tracking-tight
- **Section Headings**: text-4xl md:text-5xl, font-light
- **Product Names**: text-2xl md:text-3xl, font-normal
- **Body Text**: text-base md:text-lg, leading-relaxed
- **Prices**: text-xl md:text-2xl, Bodoni Moda, font-semibold
- **Buttons/CTAs**: text-sm md:text-base, uppercase, tracking-widest

## Layout System

### Spacing Primitives
Use Tailwind units: **2, 4, 8, 12, 16, 20, 24, 32** for consistent rhythm
- Component padding: p-8 to p-12
- Section spacing: py-20 to py-32 (desktop), py-12 to py-16 (mobile)
- Card gaps: gap-8 to gap-12
- Element spacing: space-y-4 to space-y-8

### Grid System
- **Container**: max-w-7xl mx-auto px-4 md:px-8
- **Product Grids**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- **Hero Sections**: Full-width with centered content overlay
- **Feature Sections**: 2-column layouts (lg:grid-cols-2)

## Component Library

### Navigation
- Fixed transparent header with blur backdrop on scroll
- Logo left-aligned (Cormorant Garamond, rose gold)
- Navigation links: Montserrat, uppercase, tracking-wide, mocha brown
- Cart icon with item count badge (rose gold)
- Subtle underline hover effect on links

### Hero Section (Homepage)
- **Full viewport height** (min-h-screen) with parallax-style background image
- High-quality jewellery photography (model wearing pieces, soft natural lighting)
- Centered content overlay with semi-transparent beige backdrop
- Tagline: Large Cormorant Garamond text in deep mocha
- Primary CTA: Rose gold button with blur backdrop (backdrop-blur-sm)
- Scroll indicator at bottom (animated chevron)

### Product Cards
- White/cream background with subtle shadow (shadow-lg hover:shadow-xl)
- Square aspect ratio image (aspect-square)
- Hover: Slight scale transform (hover:scale-105, transition-transform)
- Product name: Montserrat, mocha brown
- Price: Bodoni Moda, rose gold, emphasized
- Quick add-to-cart icon (rose gold, appears on hover)

### Buttons
- **Primary**: Rose gold background, cream text, rounded-full, px-8 py-3
- **Secondary**: Outline style (ring-2 ring-rose-gold), mocha text
- **Outline on Images**: Cream/white with backdrop-blur-md, no custom hover (native Button states)
- All buttons: Uppercase, tracking-widest, smooth transitions

### Forms
- Floating labels or top-aligned labels in mocha brown
- Input fields: Beige background, mocha text, rose gold focus ring
- Generous padding (p-4)
- Rounded corners (rounded-lg)

### Shopping Cart
- Slide-out drawer from right (w-96, shadow-2xl)
- Cream background with mocha text
- Item thumbnails, quantity controls, subtotal
- Rose gold checkout button (sticky at bottom)

### Product Page
- **Image Gallery**: Large main image with thumbnail carousel below
- **Product Info Panel**: Name, price, description, materials, sizing
- **Add to Cart Section**: Quantity selector, prominent button
- **Tabs**: Description, Delivery Info, Care Instructions (rose gold active state)

### Footer
- Three-column layout: Brand info, Quick links, Contact/Social
- Beige background with mocha text
- Rose gold social icons (Instagram, WhatsApp prominent)
- Newsletter signup with elegant input field

## Images

### Hero Section
**Main Hero Image**: Close-up of model wearing elegant necklace and earrings, soft natural lighting, beige/neutral clothing, blurred background. The image should evoke luxury and craftsmanship.

### Category Images
- **Earrings**: Delicate drop earrings on marble surface
- **Rings**: Stacked rings on model's hand, soft focus
- **Bracelets**: Layered bracelets with rose gold tones
- **Necklaces**: Elegant pendant piece with natural lighting
- **Hair Accessories**: Styled hair pins/combs in editorial setting

### Product Images
- White/beige background, studio lighting
- Multiple angles (front, side, detail shots)
- On-model shots showing scale and styling
- Macro details showing craftsmanship

### About/Brand Images
- Workshop/studio shots (optional)
- Founder image or brand story visuals
- Quality/craftsmanship close-ups

## Animations

Use sparingly and elegantly:
- **Fade-in on scroll** for product cards (staggered)
- **Smooth transitions** on hover states (transform, opacity)
- **Parallax effect** on hero image (subtle)
- **Cart drawer slide** animation
- Avoid excessive motion; maintain premium feel

## Responsive Breakpoints
- **Mobile**: Single column, stacked navigation
- **Tablet (md)**: 2-column grids, expanded nav
- **Desktop (lg)**: 3-4 column grids, full layout
- **Large (xl)**: Max container width, optimized spacing

## Additional Design Notes
- Use high-quality product photography throughout
- Maintain consistent 1:1 aspect ratio for product images
- Implement smooth page transitions
- Ensure touch targets are minimum 44x44px
- Keep forms clean and minimal (essential fields only)
- Use rose gold strategically as accent, not everywhere
- Generous whitespace creates premium feel
- Typography hierarchy should guide eye naturally through content