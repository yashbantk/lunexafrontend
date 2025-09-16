# Deyor - Premium Travel Proposals Platform

A modern, premium platform for operations and sales teams to create stunning travel proposals and itineraries. Built with Next.js, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

- **Premium UI/UX**: Modern, minimal design with white and red theme
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Fast Performance**: Built with Next.js 14 and optimized for speed
- **Beautiful Components**: shadcn/ui components with custom styling
- **Smooth Animations**: Framer Motion animations throughout
- **Form Management**: Advanced form handling with validation

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## 📄 Pages

1. **Home Page** - Hero section, features, and navigation
2. **Sign In Page** - Authentication with social login options
3. **Sign Up Page** - User registration with form validation
4. **Proposal Creation Page** - Advanced form for creating travel proposals

## 🎨 Design System

- **Primary Color**: #E63946 (Red)
- **Background**: White with subtle gradients
- **Typography**: Inter font family
- **Border Radius**: 2xl (1rem) for premium feel
- **Shadows**: Subtle shadows with hover effects

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎯 Key Features

### Home Page
- Sticky navigation with logo and menu
- Hero section with compelling CTA
- Features showcase with icons
- Statistics section
- Call-to-action section
- Clean footer with links

### Authentication
- Modern sign in/sign up forms
- Social login integration (Google, Microsoft)
- Form validation and error handling
- Responsive design for all devices

### Proposal Creation
- Dynamic destination management
- Comprehensive trip details form
- Traveler count and preferences
- Additional options (transfers, land-only)
- Real-time form updates

## 🔧 Customization

The platform is built with a modular component system, making it easy to customize:

- **Colors**: Update the color scheme in `tailwind.config.js`
- **Components**: Modify components in the `components/ui/` directory
- **Pages**: Edit page layouts in the `app/` directory
- **Styling**: Customize styles in `app/globals.css`

## 📦 Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── signin/            # Sign in page
│   ├── signup/            # Sign up page
│   └── proposal/          # Proposal creation page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── navigation.tsx    # Navigation component
│   └── footer.tsx        # Footer component
├── lib/                  # Utility functions
└── public/               # Static assets
```

## 🎨 Design Principles

- **Minimalism**: Clean, uncluttered interface
- **Consistency**: Uniform spacing, typography, and colors
- **Accessibility**: WCAG compliant components
- **Performance**: Optimized for fast loading
- **User Experience**: Intuitive navigation and interactions

## 🚀 Deployment

The platform is ready for deployment on Vercel, Netlify, or any other Next.js hosting platform.

```bash
npm run build
npm start
```

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for travel professionals who want to create stunning proposals that win clients.
