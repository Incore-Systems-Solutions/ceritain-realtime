/**
 * TEMPLATE untuk membuat komponen i18n wrapper
 *
 * Cara menggunakan:
 * 1. Copy template ini
 * 2. Rename file sesuai komponen (e.g., OTPModalI18n.tsx)
 * 3. Import komponen original
 * 4. Replace hardcoded text dengan t('key')
 * 5. Tambahkan translations ke i18n/messages/*.json
 */

"use client";

import { useTranslations } from "next-intl";
// Import komponen original atau props interface
// import { OriginalComponent } from '../OriginalComponent';

interface ComponentProps {
  // Define props here
}

export function ComponentI18n(props: ComponentProps) {
  // Gunakan useTranslations dengan namespace yang sesuai
  const t = useTranslations("namespace");

  // Contoh penggunaan:
  // const title = t('title');
  // const description = t('description');

  return (
    <div>
      {/* Replace hardcoded text dengan t('key') */}
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}

/**
 * CONTOH TRANSLATIONS di i18n/messages/id.json:
 *
 * {
 *   "namespace": {
 *     "title": "Judul dalam Bahasa Indonesia",
 *     "description": "Deskripsi dalam Bahasa Indonesia"
 *   }
 * }
 *
 * CONTOH TRANSLATIONS di i18n/messages/en.json:
 *
 * {
 *   "namespace": {
 *     "title": "Title in English",
 *     "description": "Description in English"
 *   }
 * }
 */
