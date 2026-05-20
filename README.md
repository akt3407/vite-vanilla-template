# vite-vanilla-template

[Vite+](https://viteplus.dev/) + バニラHTML/JS のスターターテンプレート。Tailwind CSS v4・HTMLセクション分割・レスポンシブグリッド・画像のWebP自動変換・Lint/Format を最初から同梱。

## 特徴

- **Vite+** — Vite/Oxlint/Oxfmt 統合 CLI (`vp`)。高速HMRと最適化ビルド
- **バニラHTML/JS** — フレームワーク非依存
- **Tailwind CSS v4** — 設定ファイル不要のプラグイン方式
- **HTMLセクション分割** — `vite-plugin-html-inject` の `<load>` で断片化
- **レスポンシブグリッド** — CSS変数で SP4列 / PC12列のカラム位置・幅を算出
- **画像のWebP自動変換** — `src/assets/` の jpg/png を `<img>` で参照するだけでビルド時にWebP化
- **Oxlint + Oxfmt** — Rust製の高速 Lint/Format（`vp check`）。Tailwindクラス自動ソート
- **Git pre-commit** — ステージ済みを `vp staged` で自動整形
- **VS Code 設定済み** — 保存時整形・Emmet・Tailwind補完

## クイックスタート

Vite+ CLI 未導入なら最初に1回:

```bash
curl -fsSL https://vite.plus | bash      # macOS / Linux
irm https://vite.plus/ps1 | iex           # Windows (PowerShell)
```

```bash
git clone <this-repo>
cd vite-vanilla-template
vp install
vp dev          # → http://localhost:5173
```

> パッケージマネージャは **pnpm**。`pnpm install` / `pnpm dev` でも可（`scripts` は `vp` のラッパー）。

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
└── vite.config.js     # Vite / Oxlint / Oxfmt / autoWebp を一括管理
```

## スクリプト

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

## グリッドシステム

`src/style.css` にカラム計算用の CSS変数を定義済み。**SP（〜767px）は4カラム / PC（768px〜）は12カラム** に自動で切り替わる（`100vw` 基準で算出）。

| 変数                              | 意味                                         |
| --------------------------------- | -------------------------------------------- |
| `--space-side`                    | 左右のサイドマージン                         |
| `--space-gutter`                  | カラム間のガター                             |
| `--base-grid-width`               | 1カラムの幅                                  |
| `--grid-w-1` 〜 `--grid-w-8`      | Nカラム分の幅（間のガター込み）              |
| `--grid-pos-1` 〜 `--grid-pos-12` | 各カラム左端のX座標（左端 = `--grid-pos-1`） |

使用例:

```css
.section {
  margin-inline: var(--space-side); /* 左右マージン */
}
.card {
  width: var(--grid-w-6); /* 6カラム分の幅 */
  margin-left: var(--grid-pos-3); /* 3カラム目の位置から */
}
.row {
  display: flex;
  gap: var(--space-gutter); /* ガター */
}
```

よく使う組み合わせは `@layer utilities` にクラスとして用意済み:

- `.space-x` — 左右に `--space-side` 分の `padding-inline`
- `.grid-pc` — `display: grid` + 12カラム + `--space-gutter` のガター

> カラム数・基準幅・マージン・ガターは `style.css` 冒頭の `--base-width` / `--base-grid-number` / `--base-side-margin` / `--base-gutter` を SP / PC それぞれで書き換えて調整する。

## Tailwind CSS

設定ファイル不要。`src/style.css` の `@import 'tailwindcss';` だけで使える。`@theme` にトークンを足すと `bg-brand` などが自動生成される:

```css
@theme {
  --color-brand: #6366f1;
  --font-display: 'Inter', sans-serif;
}
```

## 画像の自動WebP変換

`src/assets/` の **jpg / png** を `<img src>` で参照するだけで、**ビルド時に WebP へ自動変換**＋src書き換え（`vite.config.js` の `autoWebp` プラグイン。import 不要）。

```html
<img src="/src/assets/hero.png" alt="Hero" width="343" height="361" />
```

→ `dist/assets/hero-xxxx.webp` を出力、`src` も自動で書き換わり、元の png/jpg は出力されない。

- `width` / `height` で CLS（レイアウトシフト）を回避。品質は `autoWebp({ quality: 80 })` で調整
- **dev は変換せず元画像を配信**（変換は本番ビルドのみ。`pnpm build` で確認）
- WebP は97%+対応で通常フォールバック不要。**変換させたくない / 元形式を保ちたい画像は `public/` に置く**（public 配下は変換されない）

## SEO構成

`index.html` の `<head>` は SEO / SNSシェア / PWA を意識したテンプレート。ブロックごとにコメント区切り済みなので必要箇所だけ書き換える。

含まれる要素: 基本メタ、クロール制御（`robots` / `googlebot`）、テーマカラー、`canonical` + `hreflang`、アイコン / manifest、Open Graph フルセット、Twitter Card、**JSON-LD（WebSite + Organization、ビルド時inline展開）**。

JSON-LD は `src/seo/jsonld.js` でJSオブジェクト管理し、`vite.config.js` のミニプラグインが `<!-- jsonld -->` を `<script type="application/ld+json">` に置換。dev / build 両方で inline 展開されるため、JSを実行しないSNSクローラも認識できる。`@graph` に追加すればスキーマを増やせる。

**本番化時に置換**: `https://example.com/`（本番URL）/ `サイトタイトル`・`サイト名`（名称）/ `@your_handle`（Twitter）/ アイコン類を `/public/` に配置。

> 検証: [Rich Results Test](https://search.google.com/test/rich-results) / [Schema Validator](https://validator.schema.org/) / Lighthouse の SEO カテゴリ。

## マルチページ対応

`index.html` と同階層に `about.html` 等を足すだけ。`<a href="/about.html">` でリンクすればビルド対象に自動で含まれる（孤立ページは `vite.config.js` の `build.rollupOptions.input` に明示）。

## Lint / Format

Rust製の **Oxlint** + **Oxfmt**。設定は `vite.config.js` の `lint` / `fmt` ブロックに集約。pre-commit（`.vite-hooks/pre-commit`）でステージ済みファイルに `vp check --fix` が走る。

```bash
vp check          # まとめて検査
vp check --fix    # 自動修正
```

> VS Code 拡張: [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) / [Oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode)。

## デプロイ

`vp build`（`pnpm build`）で出力した `dist/` を静的ホスティングへ。Vercel / Netlify / Cloudflare Pages なら build command `pnpm build`・publish `dist`。

> `pnpm build` は内部で `vp build` を呼ぶため、CI では先に Vite+ CLI を入れる:
>
> ```bash
> curl -fsSL https://vite.plus | bash
> source "$HOME/.vite-plus/env"
> ```

## ライセンス

MIT
