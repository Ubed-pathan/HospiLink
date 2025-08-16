# 🏥 HospiLink - Modern Hospital Appointment Booking System

A professional, modern, and responsive hospital appointment booking system built with **Next.js 15**, **TailwindCSS**, and **Recoil** for state management. This project showcases best practices in modern web development with a focus on user experience, accessibility, and maintainability.

## ✨ Features

### 🩺 Patient Portal
- **Easy Appointment Booking** - Intuitive interface for scheduling appointments
- **Doctor Search & Filtering** - Find doctors by specialty, availability, and ratings
- **Medical History Tracking** - View past appointments and medical records
- **Real-time Notifications** - Get updates about appointment status
- **Responsive Design** - Seamless experience across all devices

### 🏥 Admin Dashboard
- **Comprehensive Analytics** - View appointment statistics and trends
- **Doctor Management** - Add, update, and manage doctor profiles
- **Department Management** - Organize hospital departments and specialties
- **Schedule Optimization** - Manage doctor availability and time slots
- **Patient Management** - Overview of patient registrations and appointments

### 🔐 Authentication & Security
- **Google OAuth Integration** - Secure single sign-on
- **OTP Verification** - Two-factor authentication for registration
- **Role-based Access** - Separate interfaces for patients and admins
- **Secure Session Management** - JWT token-based authentication

### 🎨 UI/UX Excellence
- **Modern Design** - Clean, professional healthcare-themed interface
- **Dark Mode Support** - Toggle between light and dark themes
- **Smooth Animations** - Subtle transitions and micro-interactions
- **Accessibility** - WCAG compliant design principles
- **Mobile-first Approach** - Optimized for mobile devices

## 🚀 Tech Stack

- **Frontend Framework**: Next.js 15 with App Router
- **Styling**: TailwindCSS 3.4.0 with custom design system
- **State Management**: Recoil for global state
- **Form Validation**: React Hook Form with Zod schemas
- **HTTP Client**: Axios for API requests
- **Authentication**: NextAuth.js with Google OAuth
- **TypeScript**: Full type safety throughout the application
- **Icons**: Lucide React for consistent iconography

## 🎨 Design System

### Color Palette
```css
--hospital-primary: #0E1F2F    /* Deep navy blue */
--hospital-secondary: #24425D  /* Medium blue */
--hospital-accent: #8747D0     /* Purple accent */
--hospital-light: #E2CADB      /* Light pink */
--hospital-medium: #C18DB4     /* Medium pink */
--hospital-dark: #0E1B4B       /* Dark blue */
```

### Typography
- **Font Family**: Inter (Google Fonts)
- **Responsive Scale**: Mobile-first approach with fluid typography
- **Hierarchy**: Clear heading structure for accessibility

### Components
- **Reusable Components**: Button, Input, Card, Modal, LoadingSpinner
- **Consistent Spacing**: 8px grid system
- **Hover Effects**: Subtle animations and state changes

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                # Reusable UI components
│   └── providers/         # Context providers (Recoil, Theme)
├── lib/
│   ├── atoms.ts           # Recoil state atoms
│   ├── api.ts             # Axios configuration
│   ├── api-services.ts    # API service functions
│   ├── mock-data.ts       # Development mock data
│   ├── utils.ts           # Utility functions
│   └── validations.ts     # Zod validation schemas
└── styles/                # Global styles and themes
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd hospilink
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing (when implemented)
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
```

## 🌟 Key Features Showcase

### Responsive Design
- **Mobile-first**: Optimized for mobile devices with progressive enhancement
- **Tablet & Desktop**: Adaptive layouts that scale beautifully
- **Touch-friendly**: Large tap targets and gesture support

### Performance Optimizations
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component for optimal loading
- **CSS Optimization**: TailwindCSS purging for minimal bundle size
- **SSR/SSG**: Server-side rendering for better SEO and performance

### Accessibility
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: WCAG AA compliant color combinations

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### TailwindCSS Configuration
The project uses a custom TailwindCSS configuration with:
- Custom color palette for hospital theme
- Extended animation utilities
- Dark mode support
- Custom component classes

## 📱 Responsive Breakpoints

```css
sm: 640px    /* Small devices */
md: 768px    /* Medium devices */
lg: 1024px   /* Large devices */
xl: 1280px   /* Extra large devices */
2xl: 1536px  /* 2X Extra large devices */
```

## 🤝 Contributing

This project follows modern development practices:

1. **TypeScript**: Full type safety
2. **ESLint**: Code quality and consistency
3. **Prettier**: Code formatting
4. **Git Hooks**: Pre-commit checks
5. **Component Documentation**: JSDoc comments

### Development Guidelines
- Use TypeScript for all new code
- Follow the established component patterns
- Write meaningful commit messages
- Test responsive design on multiple devices
- Ensure accessibility compliance

## 📦 Production Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deployment Options
- **Vercel**: Optimized for Next.js (recommended)
- **Netlify**: Static site deployment
- **Docker**: Containerized deployment
- **AWS/GCP/Azure**: Cloud platform deployment

## 🎯 Future Enhancements

- [ ] **Real-time Chat**: Patient-doctor communication
- [ ] **Video Consultations**: Integrated video calling
- [ ] **Payment Integration**: Online payment processing
- [ ] **Mobile App**: React Native companion app
- [ ] **AI Recommendations**: Smart appointment scheduling
- [ ] **Multi-language Support**: Internationalization
- [ ] **Advanced Analytics**: Detailed reporting dashboard
- [ ] **API Integration**: Real hospital management systems

## 📄 License

This project is created for demonstration purposes and showcases modern web development practices for healthcare applications.

## 👨‍💻 Author

**HospiLink Development Team**
- Modern web development practices
- Healthcare industry experience
- User-centered design approach
- Performance optimization expertise

---

**Built with ❤️ for better healthcare management**

*This project demonstrates professional-level code quality, modern development practices, and user-centric design principles that make it an excellent showcase for HR evaluation and technical interviews.*
