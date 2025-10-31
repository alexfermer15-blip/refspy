'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';

export default function Footer() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isDashboard = pathname?.startsWith('/dashboard');

  // ✅ НЕ показывать Footer на страницах Dashboard
  if (isDashboard) {
    return null;
  }

  const content = {
    EN: {
      tagline: 'Your competitive intelligence platform for SEO success',
      product: 'Product',
      features: 'Features',
      pricing: 'Pricing',
      tryDemo: 'Try Demo',
      resources: 'Resources',
      helpCenter: 'Help Center',
      aboutUs: 'About Us',
      blog: 'Blog',
      legal: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      contact: 'Contact',
      copyright: '© 2025 RefSpy. All rights reserved.',
    },
    RU: {
      tagline: 'Ваша платформа конкурентной разведки для SEO успеха',
      product: 'Продукт',
      features: 'Возможности',
      pricing: 'Тарифы',
      tryDemo: 'Попробовать демо',
      resources: 'Ресурсы',
      helpCenter: 'Центр помощи',
      aboutUs: 'О нас',
      blog: 'Блог',
      legal: 'Юридическое',
      privacy: 'Политика конфиденциальности',
      terms: 'Условия использования',
      contact: 'Контакты',
      copyright: '© 2025 RefSpy. Все права защищены.',
    },
  };

  const t = content[language];

  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔍</span>
              <span className="text-xl font-bold">
                <span className="text-white">Ref</span>
                <span className="text-brand-orange">Spy</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              {t.tagline}
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-brand-orange">{t.product}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/features" className="text-gray-400 hover:text-white transition">
                  {t.features}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition">
                  {t.pricing}
                </Link>
              </li>
              <li>
                <Link href="/test-parser" className="text-gray-400 hover:text-white transition">
                  {t.tryDemo}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-brand-orange">{t.resources}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition">
                  {t.helpCenter}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  {t.aboutUs}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition">
                  {t.blog}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-brand-orange">{t.legal}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition">
                  {t.privacy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition">
                  {t.terms}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition">
                  {t.contact}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>{t.copyright}</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition">{t.privacy}</Link>
            <Link href="/terms" className="hover:text-white transition">{t.terms}</Link>
            <Link href="/contact" className="hover:text-white transition">{t.contact}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
