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

export const metadata = {
  title: {
    default: 'Nishree — Fresh Groceries, Delivered',
    template: '%s · Nishree',
  },
  description:
    'Shop fresh groceries and everyday essentials at unbeatable prices, delivered to your doorstep.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <CartProvider>
          <StoreChrome>{children}</StoreChrome>
          <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar theme="light" />
        </CartProvider>
      </body>
    </html>
  );
}
