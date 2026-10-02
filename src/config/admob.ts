/**
 * Google AdMob & Google Mobile Ads Configuration
 * 
 * Configuración oficial proporcionada por el usuario:
 * - App ID: ca-app-pub-5450514125268915~6398188627
 * - Banner Ad Unit ID: ca-app-pub-5450514125268915/2541780658
 */

export const ADMOB_CONFIG = {
  // ID de la aplicación en Google AdMob (usado en AndroidManifest.xml y SDKs nativos)
  appId: 'ca-app-pub-5450514125268915~6398188627',

  // ID del bloque de anuncios tipo Banner
  bannerAdUnitId: 'ca-app-pub-5450514125268915/2541780658',

  // ID del bloque de anuncios tipo Intersticial (Pantalla Completa)
  interstitialAdUnitId: 'ca-app-pub-5450514125268915/4617279650',

  // ID de editor (Publisher ID)
  publisherId: 'ca-app-pub-5450514125268915',

  // Slot ID específico del banner
  slotId: '2541780658',

  // Slot ID específico del intersticial
  interstitialSlotId: '4617279650',

  // URL del script oficial de Google Ads
  scriptUrl: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-app-pub-5450514125268915',

  // Snippet para AndroidManifest.xml en proyectos Android / Capacitor
  androidManifestSnippet: `<!-- Google AdMob App ID -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-5450514125268915~6398188627"/>`,

  // Snippet de Capacitor AdMob para preparar y mostrar el anuncio intersticial
  capacitorInterstitialSnippet: `import { AdMob } from '@capacitor-community/admob';

// 1. Inicializar y preparar el anuncio intersticial
await AdMob.prepareInterstitial({
  adId: 'ca-app-pub-5450514125268915/4617279650',
  isTesting: false
});

// 2. Mostrar el anuncio a pantalla completa (en la 3ª apertura de PDF)
await AdMob.showInterstitial();`,
} as const;
