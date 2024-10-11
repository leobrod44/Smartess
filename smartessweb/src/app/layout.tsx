import localFont from 'next/font/local';
import '@/public/styles/globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Smartess',
  description: 'Smart living at scale',
  keywords: '',
};

const sequelSans = localFont({
  src: [
    {
      path: '../public/fonts/Sequel-Sans-Medium-Body.ttf',
      weight: '400',
    },
    {
      path: '../public/fonts/Sequel-Sans-Medium-Body.ttf',
      weight: '700',
    },
  ],
  variable: '--font-sequel-sans',
});

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <html lang='en'>
      <body className={`${sequelSans.variable} font-sans`}>
        <main>{children}</main>
      </body>
    </html>
  );
};

export default MainLayout;
