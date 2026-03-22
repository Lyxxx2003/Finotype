'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  mergeLocalizedResourceModules,
} from '@/lib/resources/data';
import { LocalizedResourceModule } from '@/types';

export default function TechnicalResourcesPage() {
  const t = useTranslations('resources');
  const homeT = useTranslations('home');
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const modules = useMemo(() => {
    try {
      const rawModules = t.raw('modules');
      return mergeLocalizedResourceModules(rawModules as LocalizedResourceModule[]);
    } catch {
      return mergeLocalizedResourceModules(null);
    }
  }, [t]);

  const openEnglishResource = (url: string): void => {
    if (typeof window === 'undefined') {
      return;
    }

    const shouldContinue = window.confirm(t('englishSourceConfirm'));
    if (shouldContinue) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  const activeModule = useMemo(
    () => modules.find((module) => module.id === activeModuleId) || null,
    [modules, activeModuleId],
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl" style={{ color: 'var(--color-text)' }}>
            {t('title')}
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            {t('subtitle')}
          </p>
          <p className="mt-3 text-sm font-medium" style={{ color: 'var(--color-primary-dark)' }}>
            {t('englishSourceNotice')}
          </p>
        </div>

        {!activeModule && (
          <>
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold md:text-3xl" style={{ color: 'var(--color-text)' }}>
                {t('modulesHeading')}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {modules.map((module, index) => (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => setActiveModuleId(module.id)}
                  className="group overflow-hidden rounded-2xl border text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-neutral-200)',
                    boxShadow: '0 8px 26px rgba(15, 23, 42, 0.08)',
                  }}
                >
                  <div className="relative h-44">
                    <Image
                      src={module.imageUrl}
                      alt={module.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          index % 2 === 0
                            ? 'linear-gradient(180deg, rgba(15,23,42,0.05) 0%, rgba(15,23,42,0.35) 100%)'
                            : 'linear-gradient(180deg, rgba(2,132,199,0.08) 0%, rgba(15,23,42,0.35) 100%)',
                      }}
                    />
                  </div>

                  <div className="space-y-4 p-5">
                    <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                      {module.title}
                    </h3>
                    <p className="line-clamp-3 text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                      {module.description}
                    </p>
                    <div className="flex items-center justify-between text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                      <span>{t('viewSubmodules')}</span>
                      <span>{t('submoduleCount', { count: module.submodules.length })}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {activeModule && (
          <section>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                  {activeModule.title}
                </h2>
                <p className="mt-2 max-w-3xl" style={{ color: 'var(--color-text-secondary)' }}>
                  {activeModule.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModuleId(null)}
                className="rounded-xl border px-4 py-2 text-sm font-semibold transition-colors hover:opacity-90"
                style={{
                  color: 'var(--color-primary)',
                  borderColor: 'var(--color-primary-light)',
                  backgroundColor: 'color-mix(in srgb, var(--color-primary-light) 10%, transparent)',
                }}
              >
                {t('backToModules')}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {activeModule.submodules.map((submodule, index) => (
                <button
                  key={submodule.id}
                  type="button"
                  onClick={() => openEnglishResource(submodule.url)}
                  className="group flex h-full flex-col rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-neutral-200)',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
                    textAlign: 'left',
                  }}
                >
                  <div className="mb-3 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold" style={{
                    color: 'var(--color-primary-dark)',
                    backgroundColor: 'color-mix(in srgb, var(--color-primary-light) 18%, var(--color-surface))',
                  }}>
                    #{index + 1}
                  </div>
                  <h3 className="mb-3 text-lg font-bold leading-snug" style={{ color: 'var(--color-text)' }}>
                    {submodule.title}
                  </h3>
                  <p className="mb-5 flex-1 text-sm leading-6 md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                    {submodule.summary}
                  </p>
                  <div className="mt-auto text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {t('openOriginal')}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            href={`/${locale}/technical/question`}
            className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 sm:w-auto"
            style={{
              background: 'var(--gradient-accent)',
              color: 'white',
              border: '2px solid rgba(14,165,233,0.5)',
              boxShadow: '0 8px 24px rgba(14,165,233,0.3), 0 2px 8px rgba(14,165,233,0.15)',
            }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {homeT('proSimulation')}
          </Link>
        </div>
      </div>
    </div>
  );
}
