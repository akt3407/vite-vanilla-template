// TODO: 本番URL / 各種テキストを置換
const SITE_URL = 'https://example.com/';
const SITE_NAME = 'サイト名';
const SITE_DESCRIPTION = 'サイトの説明文';
const ORG_NAME = '組織名';
const LOGO_URL = 'https://example.com/logo.png';

export const jsonld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: 'ja',
      publisher: { '@id': `${SITE_URL}#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: ORG_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
        width: 512,
        height: 512,
      },
    },
  ],
};
