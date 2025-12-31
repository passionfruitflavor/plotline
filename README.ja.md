# Plotline - ストーリービジュアライザー

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61dafb)

AIを活用したイベント抽出機能を備えたビジュアルタイムラインエディターです。あなたの物語テキストをインタラクティブなタイムライン可視化に変換します。

## ✨ 機能

- 📖 **ナラティブパネル** - ストーリーテキストを貼り付けまたは入力
- 🤖 **AI抽出** - Google Gemini AIを使用してキャラクター、イベント、関係性を自動抽出
- 📊 **タイムラインビュー** - シーケンサースタイルのタイムラインでストーリーイベントを可視化
- 🎭 **キャラクタートラッキング** - イベントを通じてキャラクターの状態、所持品、知識を追跡
- 🔗 **イベント接続** - イベント間の因果関係を可視化
- 🌐 **多言語対応** - 英語と日本語のUI
- 🎓 **チュートリアル** - 新規ユーザー向けのインタラクティブなチュートリアル内蔵
- 🔐 **プライバシー優先** - APIキーはメモリ上のみで保持（BYOKモデル）

## 🚀 使ってみる

### オンラインで試す

**[plotline-tools.vercel.app](https://plotline-tools.vercel.app)** にアクセスして、すぐにPlotlineを使用できます。

## 🎮 使い方

1. **ストーリーを入力** - ナラティブパネルの編集ボタンをクリックしてテキストを貼り付け
2. **シーケンスを生成** - 「✨ シーケンス生成」をクリックしてAIでイベントを抽出
3. **タイムラインを探索** - 生成されたタイムラインを表示して操作
4. **イベントを編集** - イベントをクリックして詳細を編集、接続を追加

### APIキーの設定

1. ツールバーの **⚙️ AI設定** をクリック
2. Google AI APIキーを貼り付け
3. **設定** をクリック

> **※** APIキーはメモリ上のみに保存され、ディスクには保存されません。

## 🔒 プライバシーとセキュリティ

- **クライアント側での処理** - すべてのデータはブラウザ内でローカル処理されます。ストーリーデータが当サーバに送信されることはありません。
- **AIへの直接通信** - AI機能使用時、データはブラウザからGoogle APIに直接送信され、当サーバを経由しません。
- **APIキーの安全性** - APIキーはブラウザのメモリ上のみで保持され、当サーバに送信・保存されることはありません。AIリクエスト時も、ブラウザからGoogleに直接送信されます。
- **BYOK（Bring Your Own Key）** - ご自身のAPIキーと使用量を管理できます。

## ローカル開発

```bash
git clone https://github.com/passionfruitflavor/plotline.git
cd plotline
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 🤖 AIモデル

| モデル | 説明 |
|--------|------|
| Gemini 2.5 Flash | 高速、推奨（デフォルト） |
| Gemini 2.5 Pro | 高品質、クォータ制限あり |
| Gemini 2.5 Flash Lite | 最速、軽量 |
| Gemini 3 Pro/Flash (Preview) | 最新モデル |

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 16 (Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| 状態管理 | Zustand（永続化 & Undo対応） |
| AI | Google Gemini API（クライアントサイド） |

## 📁 プロジェクト構成

```
plotline/
├── src/
│   ├── app/           # Next.js エントリーポイント
│   ├── components/    # Reactコンポーネント
│   ├── hooks/         # カスタムフック
│   ├── lib/           # ユーティリティ & AIクライアント
│   ├── locales/       # i18n翻訳ファイル
│   ├── store/         # Zustandストア
│   ├── types/         # TypeScript型定義
│   └── utils/         # ヘルパー関数
├── public/            # 静的アセット
└── package.json
```

---
