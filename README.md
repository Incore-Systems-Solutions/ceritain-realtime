# Ceritain Realtime - AI Psychology Consultation

Real-time voice consultation platform with AI psychologist powered by OpenAI Realtime API and WebRTC.

## ✨ Features

- **Real-time Voice Call** - Speak directly with AI psychologist
- 📝 **Live Transcription** - See your conversation in real-time
- 🎨 **Modern UI** - Beautiful, smooth animations with Framer Motion
- 🔊 **Audio Visualization** - Dynamic waveform based on actual audio levels
- 🔒 **Privacy First** - No recording, peer-to-peer connection
- ⚡ **Low Latency** - ~200-500ms response time
- 🌐 **WebRTC** - High-quality audio streaming

## 🚀 Quick Start

### Installation

```bash
npm install
# or
yarn install
```

### Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000/call](http://localhost:3000/call) to start a consultation.

## 📖 Usage

### Basic Implementation

```tsx
import { CallPage } from "@/components/CallPage";

function App() {
  const [showCall, setShowCall] = useState(false);

  return (
    <>
      <button onClick={() => setShowCall(true)}>Start Consultation</button>

      {showCall && (
        <CallPage
          onEndCall={() => setShowCall(false)}
          contactName="Psikolog AI"
          contactAvatar="🧠"
        />
      )}
    </>
  );
}
```

## 🏗️ Architecture

### Components

- **CallPage** (`components/CallPage.tsx`) - Main call interface with full WebRTC integration
- **useRealtimeWebRTC** (`hooks/useRealtimeWebRTC.ts`) - Custom hook for WebRTC management
- **realtime-api** (`lib/realtime-api.ts`) - API utilities for session creation

### Flow

1. User opens CallPage
2. Auto-create session via API → Get token
3. Initialize WebRTC connection with token
4. Request microphone permission
5. Establish peer connection
6. Real-time audio streaming begins
7. Live transcript & AI response displayed
8. User ends call → Cleanup & disconnect

## 🔧 Configuration

### Environment Variables (Optional)

Create `.env.local`:

```env
NEXT_PUBLIC_REALTIME_API_URL=https://apiceritain.indonesiacore.com/api/realtime/session
NEXT_PUBLIC_DEFAULT_VOICE=alloy
NEXT_PUBLIC_SYSTEM_PROMPT="jadi seorang psikolog yang membantu menyelesaikan masalah user"
```

### Voice Options

Available voices: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`

## 📚 Documentation

- [Technical Integration Guide](docs/REALTIME_INTEGRATION.md) - Detailed technical documentation
- [Setup Guide](docs/SETUP_GUIDE.md) - Complete setup and troubleshooting

## 🌐 Browser Support

| Browser      | Support |
| ------------ | ------- |
| Chrome 80+   | ✅      |
| Edge 80+     | ✅      |
| Firefox 75+  | ✅      |
| Safari 14.3+ | ✅      |

**Note:** HTTPS required in production (WebRTC security requirement)

## 🛠️ Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Framer Motion** - Smooth animations
- **WebRTC** - Real-time communication
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 📦 Project Structure

```
├── app/
│   ├── call/page.tsx          # Call demo page
│   └── page.tsx               # Home page
├── components/
│   └── CallPage.tsx           # Main call component ⭐
├── hooks/
│   └── useRealtimeWebRTC.ts   # WebRTC hook ⭐
├── lib/
│   ├── realtime-api.ts        # API utilities ⭐
│   └── config.ts              # Configuration
└── docs/
    ├── REALTIME_INTEGRATION.md
    └── SETUP_GUIDE.md
```

## 🚨 Troubleshooting

### Microphone Permission Denied

- Click lock icon in address bar
- Allow microphone access
- Refresh page

### Connection Failed

- Check internet connection
- Verify API endpoint is accessible
- Check browser console for errors

### No Audio Output

- Check speaker/headphone connection
- Verify browser audio settings
- Ensure volume is not muted

See [Setup Guide](docs/SETUP_GUIDE.md) for more troubleshooting tips.

## 🔐 Security

- Ephemeral tokens (single-use)
- HTTPS only in production
- No audio recording/storage
- Peer-to-peer connection

## 📈 Performance

- Latency: ~200-500ms
- Audio Quality: 24kHz, 16-bit
- Bandwidth: ~50-100 kbps

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Other Platforms

Ensure HTTPS is enabled (required for WebRTC).

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the documentation first.

## 📞 Support

For issues or questions, check:

1. [Technical Documentation](docs/REALTIME_INTEGRATION.md)
2. [Setup Guide](docs/SETUP_GUIDE.md)
3. Browser console for error details
