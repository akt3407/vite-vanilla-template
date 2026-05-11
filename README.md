# vite-vanilla-template

[Vite+](https://viteplus.dev/) + バニラHTML/JS で本格的なWebサイトを作るためのスターターテンプレート。Tailwind CSS v4・HTMLセクション分割・画像WebP自動変換・Lint/Format環境を最初から組み込んでいます。

## 特徴

- **Vite+** — Vite/Oxlint/Oxfmt を統合した CLI (`vp`)。高速HMRと最適化ビルド
- **バニラHTML/JS** — フレームワーク非依存。`index.html` に直接書ける
- **Tailwind CSS v4** — `@tailwindcss/vite` プラグイン方式（設定ファイル不要）
- **HTMLセクション分割** — `vite-plugin-html-inject` でヘッダー/フッター等を別ファイル化
- **画像のWebP自動変換** — `vite-imagetools` で `src/assets/` の画像を自動最適化
- **Oxlint + Oxfmt** — Rust 製の高速 Lint/Format（`vp check` で一括検証）。Tailwindクラス自動ソート対応
- **Git pre-commit フック** — ステージ済みファイルを `vp staged` で自動整形
- **VS Code 設定済み** — フォーマット・Emmet・Tailwind補完を即時利用可

## クイックスタート

Vite+ CLI（`vp`）を未インストールの場合は最初に1回だけ実行:

```bash
# macOS / Linux
curl -fsSL https://vite.plus | bash

# Windows (PowerShell)
irm https://vite.plus/ps1 | iex
```

その後、プロジェクトを起動:

```bash
git clone <this-repo>
cd vite-vanilla-template
vp install
vp dev
```

→ http://localhost:5173

> パッケージマネージャは **pnpm**（`packageManager` フィールドで宣言）。`pnpm install` / `pnpm dev` でも動作します。`scripts` は `vp` を呼び出すラッパーになっています。

## プロジェクト構成

```
vite-vanilla-template/
├── .vite-hooks/               # Vite+ が管理する Git hooks（pre-commit で vp staged 実行）
├── .vscode/
│   └── settings.json          # VS Code 設定（フォーマット・Emmet・Tailwind補完）
├── public/                    # 加工不要な静的ファイル
│   ├── favicon.svg
│   └── ...                    # apple-touch-icon, ogp.png 等
├── src/
│   ├── assets/                # ビルドで処理される画像（自動WebP化）
│   ├── sections/              # HTMLセクション断片
│   │   ├── header.html
│   │   ├── hero.html
│   │   ├── features.html
│   │   └── footer.html
│   ├── seo/
│   │   └── jsonld.js          # 構造化データ (ビルド時にindex.htmlへinline展開)
│   ├── main.js                # JSエントリ
│   └── style.css              # Tailwind import
├── index.html                 # トップページ（エントリ）
├── vite.config.js             # Vite + Oxlint(`lint`) + Oxfmt(`fmt`) 設定を一括管理
└── package.json
```

## スクリプト

`vp` を直接呼ぶか、`pnpm <name>` 経由でも実行できます。

| コマンド          | 同等の pnpm 経由 | 説明                                     |
| ----------------- | ---------------- | ---------------------------------------- |
| `vp dev`          | `pnpm dev`       | 開発サーバー起動 (http://localhost:5173) |
| `vp build`        | `pnpm build`     | 本番ビルド (`dist/` に出力)              |
| `vp preview`      | `pnpm preview`   | ビルド結果のローカルプレビュー           |
| `vp lint .`       | `pnpm lint`      | Oxlint チェック                          |
| `vp lint . --fix` | `pnpm lint:fix`  | Oxlint 自動修正                          |
| `vp fmt .`        | `pnpm format`    | Oxfmt で全ファイル整形                   |
| `vp check`        | —                | lint + format + 型チェックを一括実行     |
| `vp check --fix`  | —                | 上記を可能な範囲で自動修正               |

## HTMLセクション分割

`src/sections/` に断片HTMLを置き、`index.html` から `<load>` タグで読み込む方式（`vite-plugin-html-inject`）。

```html
<!-- index.html -->
<body>
  <load src="src/sections/header.html" />
  <main>
    <load src="src/sections/hero.html" />
    <load src="src/sections/features.html" />
  </main>
  <load src="src/sections/footer.html" />
</body>
```

ビルド時に各 `<load>` が対応HTMLに置換され、単一の `dist/index.html` として出力されます。

### 引数を渡して再利用

```html
<!-- src/sections/card.html -->
<div class="rounded border p-4">
  <h3>{=$title}</h3>
  <p>{=$desc}</p>
</div>
```

```html
<load src="src/sections/card.html" title="速い" desc="HMR最高" />
<load src="src/sections/card.html" title="軽い" desc="バンドル小" />
```

> **エディタの doctype 警告について**: `src/sections/*.html` は断片のため doctype がなく、エディタが警告を出すことがあります。`.vscode/settings.json` で handlebars 言語に関連付けて抑制済みです。ビルド出力には影響しません。

## SEO構成

`index.html` の `<head>` は SEO・SNSシェア・PWA を意識したテンプレート構成になっています。ブロック単位でコメント区切り済みなので、必要な箇所だけ書き換えればそのまま使えます。

### 含まれている要素

| ブロック     | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| 基本メタ     | `title` / `description` / `author` / `application-name`                              |
| クロール制御 | `robots` (`max-snippet:-1, max-image-preview:large` 付き) / `googlebot` / `referrer` |
| 表示テーマ   | `color-scheme: light dark` + ライト/ダーク別 `theme-color`                           |
| canonical    | `canonical` + `hreflang="ja"` + `hreflang="x-default"`                               |
| アイコン     | `favicon.svg` / `apple-touch-icon` / `site.webmanifest`                              |
| Open Graph   | `og:*` フルセット (image の type/width/height/alt も指定済み)                        |
| Twitter Card | `summary_large_image` + `site` / `creator` / `image:alt`                             |
| 構造化データ | JSON-LD (WebSite + Organization) を **ビルド時にinline展開**                         |

### TODO 箇所の置換

プレースホルダは以下に統一されています。本番化時に一括置換してください:

- `https://example.com/` → 本番URL
- `サイトタイトル` / `サイト名` / `組織名` → 実際の名称
- `@your_handle` → Twitter公式アカウント
- `/apple-touch-icon.png`、Android用アイコン → `/public/` に配置 (例: [RealFaviconGenerator](https://realfavicongenerator.net/))

### JSON-LD の管理方法

構造化データは `src/seo/jsonld.js` でJSオブジェクトとして管理し、`vite.config.js` のミニプラグインが `<!-- jsonld -->` プレースホルダを `<script type="application/ld+json">…</script>` に置換します。

```js
// src/seo/jsonld.js
export const jsonld = {
  '@context': 'https://schema.org',
  '@graph': [
    /* WebSite, Organization, ... */
  ],
};
```

```html
<!-- index.html (head内) -->
<!-- jsonld -->
```

ビルド時 (`vp build`) と dev 時 (`vp dev`) の両方で HTML に inline 展開されるため、JSを実行しないSNSクローラ (Twitter / Facebook / LINE / Slack 等) も認識できます。スキーマの種類 (Article / Product / BreadcrumbList 等) を増やしたい場合は `@graph` 配列に追加してください。

### 検証

- **JSON-LD**: [Schema Markup Validator](https://validator.schema.org/) または Google [Rich Results Test](https://search.google.com/test/rich-results)
- **OGP**: Facebook Sharing Debugger / Twitter Card Validator (本番デプロイ後)
- **総合**: Chrome DevTools → Lighthouse → SEO カテゴリで 100 点を確認

## Tailwind CSS

設定ファイル不要のv4方式。`src/style.css` に以下があるだけで使用可:

```css
@import 'tailwindcss';
```

**カスタムテーマ**を追加したい場合:

```css
@import 'tailwindcss';

@theme {
  --color-brand: #6366f1;
  --font-display: 'Inter', sans-serif;
}
```

→ `bg-brand` / `font-display` のようなユーティリティが自動生成されます。

## 画像の自動WebP変換

`vite-imagetools` を `src/assets/` 配下の画像に対して以下の挙動で設定済み:

- デフォルト: **WebP変換、quality 80**
- `?no-webp` 付与で元フォーマット保持
- `?format=avif` などで他フォーマット指定

### 基本

```html
<img src="/src/assets/hero.jpg" alt="Hero" />
```

→ ビルド時に `dist/assets/hero-xxxxx.webp` として出力。

### `<picture>` でフォールバック付き

```html
<picture>
  <source srcset="/src/assets/hero.jpg" type="image/webp" />
  <img src="/src/assets/hero.jpg?no-webp" alt="Hero" />
</picture>
```

### レスポンシブ画像

```html
<img
  src="/src/assets/hero.jpg?w=400;800;1200&as=srcset"
  alt="Hero"
  sizes="(max-width: 768px) 100vw, 1200px"
/>
```

### 利用可能なクエリ

| パラメータ | 例                | 効果                |
| ---------- | ----------------- | ------------------- |
| `format`   | `?format=avif`    | フォーマット変換    |
| `quality`  | `?quality=70`     | 品質 (1-100)        |
| `w` / `h`  | `?w=800`          | リサイズ            |
| `w` 複数   | `?w=400;800;1200` | 複数サイズ生成      |
| `as`       | `?as=srcset`      | srcset 文字列で出力 |
| `blur`     | `?blur=20`        | ぼかし              |
| `rotate`   | `?rotate=90`      | 回転                |

> **public/ との使い分け**: `public/` 配下は加工せずにそのまま配信されます。OGP画像 (`<meta property="og:image">`) は SNS 互換性のため WebP 化せず `public/ogp.png` に PNG/JPG で配置するのが安全です。

## マルチページ対応

`index.html` と同じ階層にHTMLを追加するだけで増やせます:

```
vite-vanilla-template/
├── index.html
├── about.html        ← 追加
└── contact.html      ← 追加
```

`index.html` から `<a href="/about.html">` でリンクすればビルド対象に自動含まれます。孤立ページは `vite.config.js` の `build.rollupOptions.input` に明示してください。

## Lint / Format（Oxlint + Oxfmt）

Vite+ 標準の Rust 製ツール **Oxlint**（リンター）と **Oxfmt**（フォーマッタ）を採用。設定は `vite.config.js` の `lint` / `fmt` ブロックに一元管理されています。

- **Oxlint** — `lint.plugins` で `oxc` / `unicorn` を有効化。ESLint 互換のルール名で `lint.rules` に列挙
- **Oxfmt** — セミコロンあり / シングルクォート / 100文字幅 / `sortTailwindcss` で Tailwind クラス自動ソート
- **pre-commit フック** — `.vite-hooks/pre-commit` から `vp staged` が走り、ステージ済みファイルに対して `vp check --fix` が自動実行

```bash
vp check          # まとめて検査
vp check --fix    # 可能な範囲で自動修正
```

VS Code に下記の拡張を入れると、保存時整形と補完が有効になります:

- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) — Oxlint の言語サーバー

## デプロイ

`vp build`（または `pnpm build`）で生成される `dist/` をそのまま静的ホスティングにアップロードします:

- **Vercel**: ルートディレクトリを指定して deploy（`packageManager` フィールドから pnpm を自動検出）
- **Netlify**: build command `pnpm build` / publish directory `dist`
- **GitHub Pages**: `dist/` をブランチ公開 or GitHub Actions
- **Cloudflare Pages**: build command `pnpm build` / output `dist`

> `pnpm build` も内部で `vp build` を呼ぶため、CI では事前に Vite+ CLI のインストールが必要です。ジョブの最初に次を追加してください:
>
> ```bash
> curl -fsSL https://vite.plus | bash
> source "$HOME/.vite-plus/env"
> ```

## ライセンス

MIT
