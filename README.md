# vite-vanilla-template

Vite + バニラHTML/JS で本格的なWebサイトを作るためのスターターテンプレート。Tailwind CSS v4・HTMLセクション分割・画像WebP自動変換・Lint/Format環境を最初から組み込んでいます。

## 特徴

- **Vite 8** — 高速HMRと最適化ビルド
- **バニラHTML/JS** — フレームワーク非依存。`index.html` に直接書ける
- **Tailwind CSS v4** — `@tailwindcss/vite` プラグイン方式（設定ファイル不要）
- **HTMLセクション分割** — `vite-plugin-html-inject` でヘッダー/フッター等を別ファイル化
- **画像のWebP自動変換** — `vite-imagetools` で `src/assets/` の画像を自動最適化
- **ESLint v9 + Prettier** — Flat Config / Tailwindクラス自動ソート
- **VS Code 設定済み** — フォーマット・Emmet・Tailwind補完を即時利用可

## クイックスタート

```bash
git clone <this-repo>
cd vite-vanilla-template
npm install
npm run dev
```

→ http://localhost:5173

## プロジェクト構成

```
vite-vanilla-template/
├── .vscode/
│   └── settings.json          # VS Code 設定（Prettier・Emmet・Tailwind補完）
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
│   ├── main.js                # JSエントリ
│   └── style.css              # Tailwind import
├── index.html                 # トップページ（エントリ）
├── vite.config.js             # Vite + 各プラグイン設定
├── eslint.config.js           # ESLint Flat Config
├── .prettierrc.json           # Prettier 設定
├── .prettierignore
└── package.json
```

## スクリプト

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバー起動 (http://localhost:5173) |
| `npm run build` | 本番ビルド (`dist/` に出力) |
| `npm run preview` | ビルド結果のローカルプレビュー |
| `npm run lint` | ESLint チェック |
| `npm run lint:fix` | ESLint 自動修正 |
| `npm run format` | Prettier で全ファイル整形 |

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

| パラメータ | 例 | 効果 |
|---|---|---|
| `format` | `?format=avif` | フォーマット変換 |
| `quality` | `?quality=70` | 品質 (1-100) |
| `w` / `h` | `?w=800` | リサイズ |
| `w` 複数 | `?w=400;800;1200` | 複数サイズ生成 |
| `as` | `?as=srcset` | srcset 文字列で出力 |
| `blur` | `?blur=20` | ぼかし |
| `rotate` | `?rotate=90` | 回転 |

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

## ESLint / Prettier

- **ESLint v9 Flat Config** (`eslint.config.js`)
- **Prettier**: セミコロンあり / シングルクォート / 100文字幅 / `prettier-plugin-tailwindcss` でクラス自動ソート
- 競合は `eslint-config-prettier` で抑制

VS Code に下記の拡張を入れると保存時に自動整形されます:

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## デプロイ

`npm run build` で生成される `dist/` をそのまま静的ホスティングにアップロードします:

- **Vercel**: ルートディレクトリを指定して deploy（自動検出）
- **Netlify**: build command `npm run build` / publish directory `dist`
- **GitHub Pages**: `dist/` をブランチ公開 or GitHub Actions
- **Cloudflare Pages**: build command `npm run build` / output `dist`

## ライセンス

MIT
