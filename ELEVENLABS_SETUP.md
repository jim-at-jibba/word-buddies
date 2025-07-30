# ElevenLabs Text-to-Speech Setup

The Word Buddies app supports ElevenLabs for premium text-to-speech across all devices, especially mobile. **Users can now add their own API keys directly in the app settings!**

## 1. User-Configurable API Keys (Recommended)

1. **For Users**: Go to Settings in the app and add your own ElevenLabs API key
2. **Benefits**: 
   - Premium voice quality
   - No shared limits
   - Your own usage control
   - Encrypted storage in browser

## 2. Get Your ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io)
2. Sign up for a free account
3. Navigate to your profile settings
4. Copy your API key
5. Add it in the Word Buddies app Settings page

## 3. No Environment Variables Needed

The app **no longer requires environment variables** for ElevenLabs configuration. All API keys are:
- Provided by individual users
- Encrypted and stored locally in their browser
- Never shared between users

## 4. Voice Configuration

The app uses the "Rachel" voice (`21m00Tcm4TlvDq8ikWAM`) - a clear, child-friendly voice optimized for spelling practice.

## 5. How It Works

- **User API Keys**: Each user provides their own ElevenLabs API key
- **Encrypted Storage**: API keys are encrypted and stored securely in the browser
- **Smart Fallback**: Automatically falls back to browser Speech Synthesis if no API key
- **Audio Caching**: Audio is cached for 10 minutes to reduce API calls
- **Mobile Optimized**: Designed to work reliably on iOS and Android

## 6. Features

- ✅ **User-configurable**: Each user controls their own API usage
- ✅ **Secure**: API keys encrypted with browser-specific encryption
- ✅ **No server storage**: All data stays in the user's browser
- ✅ **Smart fallback**: Works perfectly without API key using browser TTS
- ✅ **Works on iPhone Chrome** (where browser TTS often fails)
- ✅ **Audio caching** for performance and reduced API usage
- ✅ **Status indicator** shows which TTS service is active

## 7. Testing

To test the implementation:

1. **Without API Key**: App uses browser TTS (should work on most devices)
2. **With API Key**: 
   - Go to Settings and add your ElevenLabs API key
   - Use "Test Key" button to validate
   - Go to `/practice` and test word pronunciation
   - Check status indicator shows "ElevenLabs Active"

## 8. Privacy & Security

- API keys never leave the user's device
- Encryption uses Web Crypto API with browser fingerprinting
- No server-side API key storage or logging
- Users maintain full control over their API usage and costs