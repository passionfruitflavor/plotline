# Plotline - Story Visualizer

[🇯🇵 日本語版はこちら](./README.ja.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61dafb)

A visual timeline editor for stories with AI-powered event extraction. Transform your narrative text into an interactive timeline visualization.

## ✨ Features

- 📖 **Narrative Panel** - Paste or write your story text 
- 🤖 **AI Extraction** - Automatically extract characters, events, and relationships using Google Gemini AI
- 📊 **Timeline View** - Visualize story events on a sequencer-style timeline
- 🎭 **Character Tracking** - Track character states, inventory, and knowledge across events
- 🔗 **Event Connections** - Visualize cause-and-effect relationships between events
- 🌐 **Multilingual** - English and Japanese UI support
- 🎓 **Tutorial** - Built-in interactive tutorial for new users
- 🔐 **Privacy-First** - API key stored in memory only (BYOK model)

## 🚀 Getting Started

### Try Online

Visit **[TBD](https://TBD)** to use Plotline instantly.

## 🎮 Usage

1. **Enter your story** - Click Edit button in the Narrative panel and paste your text
2. **Generate sequence** - Click "✨ Generate Sequence" to extract events with AI
3. **Explore timeline** - View and interact with the generated timeline
4. **Edit events** - Click on events to edit details, add connections

### Setup API Key

1. Click **⚙️ AI Settings** in the toolbar
2. Paste your Google AI API Key
3. Click **Set**

> **Note**: Your API key is stored in memory only and never persisted to disk.

## 🔒 Privacy & Security

- **Client-Side Processing** - All data is processed locally in your browser. No story data is sent to our servers.
- **Direct AI Communication** - When using AI features, your data is sent directly from your browser to Google's API, bypassing our servers entirely.
- **API Key Safety** - Your API key is stored only in browser memory and is never transmitted to or stored on our servers. When making AI requests, the key is sent directly from your browser to Google.
- **BYOK (Bring Your Own Key)** - You control your own API key and usage.

## Local Development

```bash
git clone https://github.com/passionfruitflavor/plotline.git
cd plotline
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.



## 🤖 AI Models

| Model | Description |
|-------|-------------|
| Gemini 2.5 Flash | Fast, recommended (default) |
| Gemini 2.5 Pro | High quality, quota limited |
| Gemini 2.5 Flash Lite | Fastest, lightweight |
| Gemini 3 Pro/Flash (Preview) | Latest models |

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| State | Zustand (with persistence & undo) |
| AI | Google Gemini API (client-side) |

## 📁 Project Structure

```
plotline/
├── src/
│   ├── app/           # Next.js entrypoint
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilities & AI client
│   ├── locales/       # i18n translations
│   ├── store/         # Zustand stores
│   ├── types/         # TypeScript types
│   └── utils/         # Helper functions
├── public/            # Static assets
└── package.json
```

---

