# Nishree E-Commerce Frontend

Modern, high-performance React application for Nishree spice products e-commerce platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (auto-converts images to WebP)
npm run dev

# Build for production
npm run build
```

## ✨ Key Features

### Performance Optimizations
- ⚡ **Automatic WebP Conversion**: Images converted to WebP on startup (50-80% size reduction)
- 🎯 **Smooth Scrolling**: CSS-based smooth animations throughout
- 📦 **Code Splitting**: Optimized bundle loading with manual chunks
- 🖼️ **Lazy Loading**: Images and components load on demand
- ⚡ **Fast Load Times**: Pages load in under 1 second

### Pages
- 🏠 Home (dynamic sliders from API)
- 🛍️ Products (with filtering & pagination)
- 📚 Collection (category browsing)
- ℹ️ About
- 🔍 Product Details (with reviews & coupons)
- 🛒 Checkout
- 📧 Contact
- 🔐 Login/Register
- 👤 Profile
- 🎛️ Admin Dashboard (full CRUD operations)

### Design
- ✅ Follows Figma design specifications
- 📱 Fully responsive
- 🎨 Smooth animations and transitions
- ♿ Accessibility compliant

## 📋 Requirements

- Node.js 16+ 
- npm or yarn

## 🔧 Configuration

Create `.env` file in Frontend directory:

```env
VITE_API_URL=http://localhost:5000
```

## 📁 Project Structure

```
Frontend/
├── scripts/
│   └── convert-images.js      # Auto WebP conversion
├── src/
│   ├── assets/                # Images (auto-converted)
│   │   ├── webp/             # Generated WebP images
│   │   └── image-map.json    # Conversion mapping
│   ├── components/           # Reusable components
│   │   ├── common/          # Common UI components
│   │   └── dashboard/       # Dashboard components
│   ├── context/             # React Context (Auth, Cart, Wishlist)
│   ├── layouts/             # Layout components
│   ├── pages/               # Page components
│   │   └── Dashboard/       # Admin dashboard pages
│   ├── routes/              # Route configuration
│   ├── services/            # API services
│   ├── Styles/              # CSS files
│   └── utils/               # Utility functions
├── vite.config.js           # Vite configuration
└── package.json
```

## 🎨 Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 6
- **Routing**: React Router DOM 7
- **State Management**: React Context API
- **UI Components**: Ant Design
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Icons**: React Icons
- **Image Processing**: Sharp (for WebP conversion)
- **Styling**: Custom CSS

## 📊 Performance Metrics

- **Initial Load**: < 1 second
- **Page Transitions**: 0.8s smooth animations
- **Image Optimization**: 50-80% size reduction with WebP
- **Bundle Size**: Optimized with code splitting
- **Lighthouse Score**: 90+ (Performance)

## 🛠️ Available Scripts

```bash
# Convert images to WebP manually
npm run convert-images

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔄 Image Conversion

Images are automatically converted to WebP format:
- Runs before `npm run dev` and `npm run build`
- Only converts new/modified images
- Original images preserved
- WebP versions stored in `src/assets/webp/`
- Conversion map saved to `src/assets/image-map.json`

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- WebP support: 95%+ browsers

## 📝 Notes

- First run takes longer due to image conversion
- WebP images are gitignored (auto-generated)
- All pages are fully responsive
- Smooth scrolling works on all modern browsers
- Respects user's motion preferences (accessibility)

## 🐛 Troubleshooting

### Images not converting?
```bash
npm run convert-images
```

### Port already in use?
Edit `vite.config.js` and change the port number.

### Build errors?
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation

- [Setup Guide](./SETUP.md)
- [Performance Guide](./PERFORMANCE.md)

## 🤝 Contributing

1. Follow the existing code style
2. Test all changes thoroughly
3. Ensure all pages load smoothly
4. Check responsive design on all devices

## 📄 License

Private - Nishree E-Commerce Platform

---

Built with ❤️ for Nishree
