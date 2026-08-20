# vite-vanilla-template

[Vite](https://vite.dev/) + バニラHTML/JS のスターターテンプレート。Tailwind CSS v4・HTMLセクション分割・レスポンシブグリッド・画像のWebP自動変換・Lint/Format を最初から同梱。

## 特徴

- **Vite** — 高速HMRと最適化ビルド
- **バニラHTML/JS** — フレームワーク非依存
- **Tailwind CSS v4** — 設定ファイル不要のプラグイン方式
- **HTMLセクション分割** — `vite-plugin-html-inject` の `<load>` で断片化
- **画像のWebP自動変換** — `src/assets/` の jpg/png を `<img>` で参照するだけで、ビルド時に WebP + `<picture>` 化
- **ESLint + Prettier** — Lint/Format。Tailwindクラス自動ソート付き
- **VS Code 設定済み** — 保存時整形・Emmet・Tailwind補完

## クイックスタート

```bash
git clone <this-repo>
cd vite-vanilla-template
pnpm install
pnpm dev        # → http://localhost:5173
```

> パッケージマネージャは **pnpm**。

## プロジェクト構成

```
├── public/            # 加工不要な静的ファイル（変換されない）
├── src/
│   ├── assets/        # ビルドで処理。jpg/png は自動WebP化
│   ├── sections/      # HTMLセクション断片（header/hero/features/footer）
│   ├── seo/jsonld.js  # 構造化データ（ビルド時にinline展開）
│   ├── main.js        # JSエントリ
│   └── style.css      # Tailwind + デザイントークン + グリッド変数
├── index.html         # エントリ
├── vite.config.js     # Vite / autoWebp
├── eslint.config.js   # ESLint（flat config）
└── .prettierrc.json   # Prettier
```

## スクリプト

| コマンド            | 説明                                     |
| ------------------- | ---------------------------------------- |
| `pnpm dev`          | 開発サーバー起動 (http://localhost:5173) |
| `pnpm build`        | 本番ビルド (`dist/` に出力)              |
| `pnpm preview`      | ビルド結果のローカルプレビュー           |
| `pnpm lint`         | ESLint チェック                          |
| `pnpm lint:fix`     | ESLint 自動修正                          |
| `pnpm format`       | Prettier で全ファイル整形                |
| `pnpm format:check` | 整形漏れのチェックのみ（CI 向け）        |

## HTMLセクション分割

`src/sections/` の断片を `index.html` から `<load>` で読み込む（`vite-plugin-html-inject`）。ビルド時に展開され単一の `dist/index.html` になる。

```html
<body>
  <load src="src/sections/header.html" />
  <main>
    <load src="src/sections/hero.html" />
  </main>
  <load src="src/sections/footer.html" />
</body>
```

引数つきで再利用も可能:

```html
<!-- src/sections/card.html -->
<div>
  <h3>{=$title}</h3>
  <p>{=$desc}</p>
</div>
```

```html
<load src="src/sections/card.html" title="速い" desc="HMR最高" />
```

> 断片HTMLは doctype が無くエディタが警告を出すことがある（`.vscode/settings.json` で抑制済み。出力には影響なし）。

## Tailwind CSS

設定ファイル不要。`src/style.css` の `@import 'tailwindcss';` だけで使える。`@theme` にトークンを足すと `bg-brand` などが自動生成される:

```css
@theme {
  --color-brand: #6366f1;
  --font-display: 'Inter', sans-serif;
}
```

## 画像の自動WebP変換（`<picture>` 化）

`src/assets/` の **jpg / png** を `<img src>` で参照するだけで、**ビルド時に WebP を生成して `<picture>` へ置き換え**る（`vite.config.js` の `autoWebp` プラグイン。import 不要）。

```html
<img src="/src/assets/hero.png" alt="Hero" width="343" height="361" />
```

→ ビルド後:

```html
<picture>
  <source srcset="/assets/hero-xxxx.webp" type="image/webp" />
  <img src="/assets/hero-yyyy.png" alt="Hero" width="343" height="361" />
</picture>
```

WebP 非対応環境では元画像にフォールバックする（元の png/jpg も `dist/assets/` に出力される）。`<img>` の属性はそのまま引き継がれる。

- `width` / `height` で CLS（レイアウトシフト）を回避。品質は `autoWebp({ quality: 80 })` で調整
- **dev は変換せず元の `<img>` のまま配信**（変換は本番ビルドのみ。`pnpm build` で確認）
- **手書きの `<picture>...</picture>` の中身は変換されない**。アートディレクション等を自前で書きたい場合はそのまま書く
- **変換させたくない画像は `public/` に置く**（public 配下は変換されない）
- ⚠️ ビルド後は `<img>` が `<picture>` に包まれるため、`.parent > img` のような子セレクタは効かなくなる（`.parent img` を使う）

## SEO構成

`index.html` の `<head>` は SEO / SNSシェア / PWA を意識したテンプレート。ブロックごとにコメント区切り済みなので必要箇所だけ書き換える。

含まれる要素: 基本メタ、クロール制御（`robots` / `googlebot`）、テーマカラー、`canonical` + `hreflang`、アイコン / manifest、Open Graph フルセット、Twitter Card、**JSON-LD（WebSite + Organization、ビルド時inline展開）**。

JSON-LD は `src/seo/jsonld.js` でJSオブジェクト管理し、`vite.config.js` のミニプラグインが `<!-- jsonld -->` を `<script type="application/ld+json">` に置換。dev / build 両方で inline 展開されるため、JSを実行しないSNSクローラも認識できる。`@graph` に追加すればスキーマを増やせる。

**本番化時に置換**: `https://example.com/`（本番URL）/ `サイトタイトル`・`サイト名`（名称）/ `@your_handle`（Twitter）/ アイコン類を `/public/` に配置。

> 検証: [Rich Results Test](https://search.google.com/test/rich-results) / [Schema Validator](https://validator.schema.org/) / Lighthouse の SEO カテゴリ。

## マルチページ対応

`index.html` と同階層に `about.html` 等を足すだけ。`<a href="/about.html">` でリンクすればビルド対象に自動で含まれる（孤立ページは `vite.config.js` の `build.rollupOptions.input` に明示）。

## Lint / Format

**ESLint**（`eslint.config.js` / `@eslint/js` の recommended）+ **Prettier**（`.prettierrc.json`）。Prettier は `prettier-plugin-tailwindcss` で Tailwind クラスも並べ替える。

```bash
pnpm lint --fix   # Lint 自動修正
pnpm format       # 整形
```

> VS Code 拡張: [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) / [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) / [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)。

## デプロイ

`pnpm build` で出力した `dist/` を静的ホスティングへ。Vercel / Netlify / Cloudflare Pages なら build command `pnpm build`・publish `dist`。

## ライセンス

MIT
