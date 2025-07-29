# ElevenLabs Text-to-Speech Setup

The Word Buddies app now uses ElevenLabs for reliable text-to-speech across all devices, especially mobile. Here's how to set it up:

## 1. Get ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io)
2. Sign up for an account
3. Navigate to your profile settings
4. Copy your API key

## 2. Configure Environment Variables

1. Copy `.env.sample` to `.env.local`:
   ```bash
   cp .env.sample .env.local
   ```

2. Edit `.env.local` and replace the placeholder with your actual API key:
   ```bash
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_actual_api_key_here
   NEXT_PUBLIC_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
   NEXT_PUBLIC_ELEVENLABS_API_URL=https://api.elevenlabs.io/v1
   ```

## 3. Voice Configuration

The default voice ID (`21m00Tcm4TlvDq8ikWAM`) is "Rachel" - a clear, child-friendly voice. You can change this to any voice ID from your ElevenLabs account.

## 4. How It Works

- **Primary**: Uses ElevenLabs API for high-quality, reliable speech
- **Fallback**: Falls back to browser Speech Synthesis API if ElevenLabs fails
- **Caching**: Audio is cached for 10 minutes to reduce API calls
- **Mobile Optimized**: Designed to work reliably on iOS and Android

## 5. Features

- ✅ Works on iPhone Chrome (where browser TTS fails)
- ✅ Consistent voice across all devices
- ✅ Audio caching for performance
- ✅ Automatic fallback to browser TTS
- ✅ Kid-friendly voice settings
- ✅ Memory leak prevention

## 6. Testing

After setting up your API key:

1. Run the development server: `npm run dev`
2. Go to `/practice` and test the word pronunciation
3. Check browser console for ElevenLabs status messages
4. Test on mobile devices to verify reliability

## API Usage

The app caches audio for repeated words, so API usage should be minimal for common spelling words. Each unique word generates one API call, then it's cached.