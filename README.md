# RPG Productivity Tracker 🚀

A gamified, offline-first productivity application built with React Native and Expo. This app helps you manage your daily life by turning your habits, tasks, and finances into an RPG-like experience where you can level up different aspects of your life.

## 🌟 Features

- **Gamified Task Management**: Create, track, and complete tasks to earn XP.
- **Task Statuses**: Manage your tasks through Active, Done, Fail, and Archive states.
- **Budget Quest (Finance Tracker)**: Keep track of your daily expenses. If you stay under budget, you automatically complete a system quest and earn Discipline XP. If you go over, you lose XP!
- **Pomodoro Timer**: Stay focused with a built-in Pomodoro timer.
- **Interactive Markdown Notes**: Write notes and execute specific code/tasks right from the editor.
- **RPG Stats System**: Level up 6 distinct categories based on your real-life activities:
  - 💪 Physical
  - 🧠 Intelligence
  - 🎨 Creativity
  - 🛡️ Discipline
  - 👥 Social
  - 🚀 Productivity
- **Data Privacy**: 100% Offline-First. All your data is stored locally on your device using SQLite.

## 🛠 Tech Stack

- **Framework**: React Native & [Expo](https://expo.dev/)
- **Language**: TypeScript
- **Database**: SQLite (`expo-sqlite`)
- **Styling**: Vanilla Stylesheet & Custom Design System (Dark Mode Only)
- **Icons**: Lucide React Native
- **Testing**: Jest & React Native Testing Library

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the app**
   ```bash
   npx expo start
   ```

3. **Run Tests**
   ```bash
   npm run test
   ```

## 🏗 Project Structure

- `src/app/`: Expo Router file-based navigation (Tabs, Layouts).
- `src/components/`: Reusable UI components (Buttons, Modals, Charts).
- `src/db/`: Database configuration, schemas, and repositories.
- `src/context/`: React context providers (e.g., Theme Context).
- `src/constants/`: Design tokens, colors, and typography.
- `__tests__/`: Jest unit tests for components and business logic.

---
*Built with ❤️ focusing on clean architecture, beautiful UI, and an engaging user experience.*
