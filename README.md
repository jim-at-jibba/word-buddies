# 🐱 Word Buddies - Spelling Practice for Kids

A delightful cat-themed spelling practice web application designed for Year 3 students (ages 7-8). Built with Next.js, TypeScript, and featuring a friendly cat mascot to make learning spelling fun and engaging!

## ✨ Features

- **🔊 Audio-First Learning**: Text-to-speech functionality to help children hear and learn word pronunciation
- **🎯 Smart Practice System**: Spaced repetition algorithm that focuses on words that need more practice
- **📊 Progress Tracking**: Detailed statistics to monitor learning progress and improvements
- **🐱 Cat-Themed UI**: Friendly, animated cat mascot that provides encouragement and guidance
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **♿ Accessibility**: Built with ARIA labels, keyboard navigation, and screen reader support
- **🎨 Kid-Friendly Design**: Colorful, engaging interface with large buttons and clear typography

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd word-buddies-next
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run db:generate
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── words/         # Word fetching and submission
│   │   ├── sessions/      # Practice session management
│   │   └── progress/      # Progress tracking
│   ├── practice/          # Spelling practice page
│   ├── results/           # Session results page
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── CatMascot.tsx     # Animated cat character
│   ├── WordPlayer.tsx    # Audio playback component
│   ├── SpellingInput.tsx  # Custom input component
│   ├── ResultsCard.tsx   # Individual result display
│   └── ProgressTracker.tsx # Progress visualization
├── lib/                   # Utility functions and services
│   ├── db/               # Database schema and connection
│   ├── data/             # Word lists and static data
│   ├── spelling-logic.ts  # Core spelling and learning logic
│   └── speech.ts         # Text-to-speech service
└── types/                # TypeScript type definitions
```

## 📚 How It Works

### Spaced Repetition System
The app uses a smart learning algorithm that:
- Introduces new words gradually
- Reviews incorrectly spelled words more frequently
- Spaces out correctly spelled words over increasing intervals
- Adapts difficulty based on user performance

### Practice Sessions
- Each session includes 5 words
- Mix of new words and review words
- Real-time feedback with encouraging messages
- Detailed results showing progress

### Progress Tracking
- Words learned and mastered
- Average spelling accuracy
- Session history and statistics
- Visual progress indicators

## 🎨 Design System

### Cat Theme Colors
- **Orange** (`#FF8C42`): Primary brand color for buttons and highlights
- **Cream** (`#FFF4E6`): Warm background color
- **Success Green** (`#34D399`): Correct answers and achievements
- **Warning Yellow** (`#F59E0B`): Needs attention
- **Error Red** (`#EF4444`): Incorrect answers

### Typography
- **Primary Font**: Comic Neue - Child-friendly, readable font
- **System Fonts**: Geist Sans and Geist Mono for UI elements

### Animations
- Smooth transitions and micro-interactions
- Cat mascot animations that respond to user actions
- Loading states and feedback animations

## 🛠️ Development Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Drizzle Studio for database inspection
```

## 🗄️ Database Schema

The app uses SQLite with Drizzle ORM:

- **words**: Stores word list with learning statistics
- **sessions**: Practice session records
- **word_attempts**: Individual spelling attempts with results

## 🌐 Browser Support

- **Speech Synthesis**: Chrome, Edge, Safari, Firefox (latest versions)
- **Modern Browsers**: All features supported in browsers with ES2020 support
- **Fallbacks**: Visual word display when speech is not supported

## 🔧 Configuration

### Environment Variables
No environment variables required for local development.

### Next.js Configuration
- Configured for SQLite database integration
- Optimized webpack settings for better-sqlite3
- Responsive image optimization

## 📱 Responsive Breakpoints

- **Mobile**: 0-768px
- **Tablet**: 768px-1024px  
- **Desktop**: 1024px+

## ♿ Accessibility Features

- ARIA labels for all interactive elements
- Keyboard navigation support
- High contrast mode compatibility
- Screen reader friendly
- Focus management
- Alternative text for all images

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Deploy with default settings
3. SQLite database will be created automatically

### Other Platforms
The app can be deployed to any platform supporting Node.js applications. Ensure SQLite is supported or configure an alternative database.

## 🧪 Testing

The application includes:
- Error boundaries for graceful error handling
- Input validation and sanitization  
- Network error handling
- Accessibility testing compatibility

## 📈 Performance Optimizations

- Next.js automatic code splitting
- Image optimization with next/image
- Efficient re-rendering with React patterns
- Minimal bundle size with tree shaking
- Fast development with Turbopack

## 🤝 Contributing

This is an educational project. Contributions welcome for:
- Additional word lists
- New animation features
- Accessibility improvements
- Performance optimizations

## 📄 License

This project is created for educational purposes. Please ensure compliance with any educational content licensing requirements.

## 🎯 Target Audience

**Primary Users**: Year 3 students (ages 7-8)
**Secondary Users**: Parents, teachers, and educators
**Use Cases**: Home learning, classroom activities, spelling practice

---

Built with ❤️ and 🐱 for young learners everywhere!