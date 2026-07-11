import { Inter } from 'next/font/google';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { CartProvider } from '@/lib/cart-context';
import StoreChrome from '@/components/layout/StoreChrome';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nishree.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Nishree — Pure Indian Spices, Freshly Delivered',
    template: '%s · Nishree',
  },
  description:
    'Nishree brings you authentic, freshly-ground Indian spices, masalas and whole spices at honest prices — for homes, retailers and distributors. Flavours of India, delivered to your door.',
  applicationName: 'Nishree',
  keywords: [
    'Nishree', 'Indian spices', 'masala', 'garam masala', 'whole spices', 'ground spices',
    'turmeric', 'chilli powder', 'buy spices online', 'wholesale spices', 'spice distributor',
    'authentic spices', 'flavours of India',
  ],
  authors: [{ name: 'Nishree' }],
  creator: 'Nishree',
  publisher: 'Nishree',
  category: 'food',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Nishree',
    title: 'Nishree — Pure Indian Spices, Freshly Delivered',
    description:
      'Authentic, freshly-ground Indian spices and masalas at honest prices — retail and wholesale. Flavours of India, delivered to your door.',
    url: '/',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nishree — Pure Indian Spices, Freshly Delivered',
    description: 'Authentic Indian spices and masalas — retail and wholesale. Flavours of India.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport = {
  themeColor: '#b72d24',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <CartProvider>
          <StoreChrome>{children}</StoreChrome>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            theme="light"
            className="nishree-toast-container"
            toastClassName="nishree-toast"
            progressClassName="nishree-toast-progress"
          />
        </CartProvider>
      </body>
    </html>
  );
}
