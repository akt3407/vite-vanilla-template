// TODO: 本番URL / 各種テキストを置換
const SITE_URL = 'https://example.com/';
const SITE_DESCRIPTION = 'サイトの説明文';
const ORG_NAME = '店名';

// 店舗がある場合
// 住所、電話番号、チェックインタイム、部屋数、amenityFeature都度書き換える(店舗ある場合)
export const jsonld = {
  '@context': 'https://schema.org',
  '@type': 'Hotel', // TODO: 業種に応じて変更（LocalBusiness / CafeOrCoffeeShop / BeautySalon など）
  name: ORG_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  telephone: '+81-3-1234-5678',
  address: {
    '@type': 'PostalAddress',
    postalCode: '150-0002',
    addressRegion: '東京都',
    addressLocality: '渋谷区',
    streetAddress: '渋谷1-2-3 サンプルビル4F',
    addressCountry: 'JP',
  },
  checkinTime: '15:00',
  checkoutTime: '10:00',
  numberOfRooms: 24,
  petsAllowed: false,
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: '無料Wi-Fi', value: true },
    { '@type': 'LocationFeatureSpecification', name: '大浴場', value: true },
    { '@type': 'LocationFeatureSpecification', name: '駐車場', value: true },
  ],
};

// 実店舗がない場合
// export const jsonld = {
//   '@context': 'https://schema.org',
//   '@type': 'Organization',
//   name: ORG_NAME,
//   description: SITE_DESCRIPTION,
//   url: SITE_URL,
//   logo: 'https://example.com/logo.png',
// };
