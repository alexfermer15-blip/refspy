'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Страницы БЕЗ навигации и футера
  const hideLayoutPaths = [
    '/login',
    '/sign-in',
    '/sign-up',
    '/admin/login',
  ];

  const shouldHideLayout = hideLayoutPaths.some(path => pathname.startsWith(path));

  if (shouldHideLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
