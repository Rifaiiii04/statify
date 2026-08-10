# Statify ⚡

**Statify** is a gamified, offline-first productivity and life-tracking mobile app built with React Native and Expo. It turns your daily tasks, habits, schedules, and financial budget into an RPG-like system where you gain XP and level up real-life stats.

---

## ✨ Features

- **⚡ Neo-Brutalist UI**: High-contrast, dark-mode-first aesthetic with bold borders, tactile shadows, and distinct accent colors per tab.
- **📋 Gamified Task Management**:
  - Filter tasks by **Active**, **Inactive**, **Done**, **Fail**, and **Archive**.
  - **Dynamic Task Activation**: Configure specific recurrence days (e.g., *Thu, Fri*) or date ranges (e.g., *15 Aug - 20 Aug*). Tasks activate and deactivate automatically.
  - **Midnight Auto-Check**: Automatic status re-evaluation every night at 00:00.
  - **Compact Cards**: Clean, compact layout displaying detailed schedule badges.
- **💰 Money Management & Daily Budget Quest**:
  - Track income and daily expenses with automatic Indonesian Rupiah formatting (`Rp 50.000`).
  - Real-time **Daily Budget Quest**: Exceeding your daily limit immediately triggers a quest failure and applies a Discipline XP penalty; staying under restores/rewards XP.
- **📅 Schedule & Timeline**: Visual weekly Gantt charts and schedule timelines for plan tracking.
- **⏱️ Focus & Pomodoro Timer**: Built-in Pomodoro timer accessible via a floating action button.
- **📝 Markdown Notes**: Clean, lightweight note-taking interface.
- **🎮 RPG Stats System**: Level up 6 core life attributes based on real actions:
  - Physical
  - Intelligence
  - Creativity
  - Discipline
  - Social
  - Productivity
- **🔒 100% Offline & Private**: Powered by local SQLite database. No external tracking or server dependency.

---

## 🛠 Tech Stack

- **Framework**: React Native & [Expo](https://expo.dev/) (Expo Router)
- **Language**: TypeScript
- **Database**: SQLite (`expo-sqlite`)
- **Animations**: `react-native-reanimated` & `react-native-worklets`
- **Icons**: Lucide React Native
- **Styling**: Custom Neo-Brutalist Design Tokens (`src/constants/design.ts`)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Expo Go app](https://expo.dev/go) or an Android/iOS Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/statify.git
   cd statify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

---

## 📦 Building the App (APK)

### Using EAS Build (Recommended Cloud Build)

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Login to your Expo account:
   ```bash
   eas login
   ```
3. Run the APK build command:
   ```bash
   eas build -p android --profile preview
   ```

### Local Native Build

1. Prebuild native directories:
   ```bash
   npx expo prebuild
   ```
2. Build release APK:
   ```bash
   cd android && .\gradlew assembleRelease
   ```

---

## 🏗 Project Structure

```
├── src/
│   ├── app/                # Expo Router screens (Tabs, Onboarding, Layouts)
│   ├── components/         # Reusable UI components (Buttons, Inputs, Cards, DatePicker)
│   ├── constants/          # Neo-Brutalist design tokens & theme configuration
│   ├── context/            # React Context (Theme, Global State)
│   ├── db/                 # SQLite configuration, repositories, & queries
│   └── utils/              # Helper utilities & task scheduling logic
├── assets/                 # App icons, splash screens, & images
├── eas.json                # EAS Build configuration
└── package.json
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
