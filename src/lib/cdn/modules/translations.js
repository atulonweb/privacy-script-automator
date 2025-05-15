
/**
 * Translations for ConsentGuard
 */

import { config } from './core.js';

// Default translations
export const defaultTranslations = {
  en: {
    mainText: 'This website uses cookies to ensure you get the best experience on our website.',
    acceptAll: 'Accept All',
    rejectAll: 'Reject All',
    customize: 'Customize',
    cookiePreferences: 'Cookie Preferences',
    preferencesDescription: 'Customize your cookie preferences below. Some cookies are essential for the website to function and cannot be disabled.',
    savePreferences: 'Save Preferences',
    poweredBy: 'Powered by',
    required: 'Required',
    privacyPolicy: 'For more information, please read our',
    privacyPolicyLink: 'Privacy Policy',
    cookieSettings: 'Cookie Settings',
    additionalInfo: 'Additional Information'
  },
  fr: {
    mainText: 'Ce site utilise des cookies pour vous garantir la meilleure expérience sur notre site.',
    acceptAll: 'Tout accepter',
    rejectAll: 'Tout refuser',
    customize: 'Personnaliser',
    cookiePreferences: 'Préférences de cookies',
    preferencesDescription: 'Personnalisez vos préférences de cookies ci-dessous. Certains cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.',
    savePreferences: 'Enregistrer les préférences',
    poweredBy: 'Propulsé par',
    required: 'Obligatoire',
    privacyPolicy: 'Pour plus d\'informations, veuillez lire notre',
    privacyPolicyLink: 'Politique de confidentialité',
    cookieSettings: 'Paramètres des cookies',
    additionalInfo: 'Informations supplémentaires'
  },
  es: {
    mainText: 'Este sitio web utiliza cookies para garantizar que obtenga la mejor experiencia en nuestro sitio web.',
    acceptAll: 'Aceptar todo',
    rejectAll: 'Rechazar todo',
    customize: 'Personalizar',
    cookiePreferences: 'Preferencias de cookies',
    preferencesDescription: 'Personalice sus preferencias de cookies a continuación. Algunas cookies son esenciales para que el sitio web funcione y no se pueden desactivar.',
    savePreferences: 'Guardar preferencias',
    poweredBy: 'Desarrollado por',
    required: 'Requerido',
    privacyPolicy: 'Para más información, por favor lea nuestra',
    privacyPolicyLink: 'Política de Privacidad',
    cookieSettings: 'Configuración de cookies',
    additionalInfo: 'Información adicional'
  }
};

/**
 * Get translation for a specific key
 * @param {string} key - Translation key
 */
export function getTranslation(key) {
  const lang = config.language || 'en';
  
  // Try to get from custom translations first
  if (config.translations && config.translations[lang] && config.translations[lang][key]) {
    return config.translations[lang][key];
  }
  
  // Fall back to default translations
  if (defaultTranslations[lang] && defaultTranslations[lang][key]) {
    return defaultTranslations[lang][key];
  }
  
  // Ultimate fallback to English
  return defaultTranslations.en[key] || key;
}
