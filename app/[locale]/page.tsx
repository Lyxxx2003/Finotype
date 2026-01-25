'use client';

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { clearAnswers } from "@/lib/storage";
import { useTranslations } from 'next-intl';

export default function Home() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('home');

  const startTest = () => {
    clearAnswers();
    router.push(`/${locale}/standard/start`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 font-sans bg-gray-50 text-gray-900">
      <main className="flex flex-col gap-8 items-center text-center max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight text-blue-600 sm:text-6xl">
          {t('title')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('subtitle')}
        </p>
        
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <button
            onClick={startTest}
            className="rounded-full bg-blue-600 text-white px-8 py-4 text-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            {t('standardTest')}
          </button>
          <Link
            href={`/${locale}/pro/game`}
            className="rounded-full bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 text-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
          >
            {t('proSimulation')}
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-gray-400 text-sm">
        {t('footer', { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
