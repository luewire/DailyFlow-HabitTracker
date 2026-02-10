# 🌿 DailyFlow - Habit & Focus Tracker

> **All-in-one productivity app** untuk tracking habits, tasks, workouts, water intake, dan focus sessions dengan premium dark-green design.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## 📸 Screenshots

*Coming soon - Add your app screenshots here*

---

## ✨ Features

### 📋 **Tasks Management**
- ✅ Create, edit, delete tasks dengan drag & drop reordering
- 🎯 Priority system (High/Medium/Low) dengan color-coded badges
- 📅 **Interactive Calendar View** - Klik tanggal untuk lihat tasks per hari
- 🗓️ Due date tracking dengan date picker
- 🔍 Filter by priority (All/High/Medium/Low)
- 💬 Daily motivational quotes
- 📊 Today's progress tracking
- 🌊 Smooth animations untuk toggle sections

### ⏱️ **Focus Timer (Pomodoro)**
- ⏰ Adjustable timer (1-60 minutes) dengan +/- controls
- 🎯 Link focus session ke habit/workout/task tertentu
- 📈 Progress tracking untuk setiap habit
- 💪 Support untuk:
  - 🧘 Meditation (15 min target)
  - 🏃 Running (5 km target)
  - 💧 Water intake (8 glasses target)
  - 🏋️ Workout exercises
  - ✅ Tasks
- ✨ Completion screen dengan celebration animation
- 🔄 Auto-save progress ke Firestore

### 💪 **Workout Tracker**
- 🏋️ Daily workout exercises dengan completion checkboxes
- 📊 Weekly progress visualization
- 📈 **Premium Stats Modal** dengan:
  - Dual-line performance chart (This Week vs Last Week)
  - Interactive tooltips on hover
  - Monthly activity heatmap
  - Streak tracking (current & longest)
  - Perfect days counter
- 🏃 **Running Tracker** dengan distance & duration logging
- 📅 Historical data view
- 🎨 Gradient backgrounds & smooth animations

### 📊 **Stats Dashboard**
- 📈 **Weekly Performance Chart** - Dual-line curve dengan gradient fill
  - This Week (green glow) vs Last Week (gray)
  - Interactive data points dengan tooltips
  - Best Day, Weekly Avg, vs Last Week stats
- 📅 **Monthly Progress Heatmap**
  - Activity intensity visualization
  - Perfect Days, Current Streak, Longest Streak
  - Day numbers dengan color-coded completion levels
- 🎯 **Habit Breakdown** - Completion percentage per habit
- 🌊 Premium gradient cards dengan consistent design

### 💧 **Water Intake Tracker**
- 💦 8 glasses daily target
- ➕ Quick add buttons (1 glass / 2 glasses)
- 📊 Visual progress bar
- 📅 Weekly tracking

### 🎨 **UI/UX Features**
- 🌙 **Premium Dark-Green Theme** - Modern gradient backgrounds
- 📱 **Mobile-First Responsive Design** - Perfect di semua devices
- 🎬 **Smooth Animations**:
  - `animate-slide-down` - Calendar & forms
  - `animate-fade-in` - Selected date tasks
  - `animate-expand` - Habit sub-items
  - `animate-scale-up` - Modals & completion screens
  - `animate-stagger` - List items dengan delay
- 💀 **Skeleton Loading States** - Smooth loading experience
- 🎯 **Empty States** dengan helpful icons & messages
- 🔔 **Bottom Navigation** - Easy thumb-reach navigation
- ✨ **Micro-interactions** - Hover effects, active states, transitions

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm atau yarn
- Firebase project (untuk Firestore)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/DailyFlowTodolist.git
cd DailyFlowTodolist
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 3. Setup Firebase

1. Buat project di [Firebase Console](https://console.firebase.google.com/)
2. Enable **Firestore Database**
3. Copy Firebase config ke `app/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Run Development Server

```bash
npm run dev
# atau
yarn dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5.0 |
| **Database** | Firebase Firestore |
| **Authentication** | Firebase Auth |
| **Styling** | TailwindCSS 4.0 |
| **State Management** | Zustand |
| **Drag & Drop** | @hello-pangea/dnd |
| **Icons** | Lucide React |
| **Date Utils** | date-fns |
| **Animations** | CSS Keyframes + Cubic-bezier |

---

## 📁 Project Structure

```
DailyFlowTodolist/
├── app/
│   ├── config/
│   │   └── firebase.ts          # Firebase configuration
│   ├── dashboard/
│   │   ├── focus/               # Focus timer page
│   │   ├── stats/               # Statistics dashboard
│   │   ├── tasks/               # Tasks management
│   │   ├── workout/             # Workout tracker
│   │   │   ├── detail/          # Workout detail page
│   │   │   └── running/         # Running tracker
│   │   └── layout.tsx           # Dashboard layout
│   ├── login/                   # Login page
│   └── globals.css              # Global styles + animations
│
├── components/
│   ├── dashboard/
│   │   └── WorkoutStatsModal.tsx  # Workout stats modal
│   ├── layout/
│   │   ├── BottomNav.tsx        # Bottom navigation
│   │   └── Header.tsx           # Top header
│   ├── tasks/
│   │   ├── AddTaskForm.tsx      # Add task form
│   │   └── TaskItem.tsx         # Task item component
│   └── ui/
│       ├── Button.tsx           # Reusable button
│       ├── EmptyState.tsx       # Empty state component
│       ├── Modal.tsx            # Modal wrapper
│       └── SkeletonLoader.tsx   # Loading skeletons
│
├── store/
│   ├── habitStore.ts            # Habit state (Zustand + Firestore)
│   ├── taskStore.ts             # Task state (Zustand + Firestore)
│   ├── waterStore.ts            # Water intake state
│   └── workoutStore.ts          # Workout state
│
├── hooks/
│   └── useAuth.tsx              # Authentication hook
│
└── types/
    └── index.ts                 # TypeScript types
```

---

## 🎨 Design System

### Color Palette

```css
--bg-primary: #0D1B0E;        /* Dark green background */
--bg-card: #1A2E1C;           /* Card background */
--accent-green: #00E676;      /* Primary accent */
--text-primary: #FFFFFF;      /* White text */
--text-muted: #5A7D5E;        /* Muted text */
```

### Animation System

| Class | Effect | Duration | Easing |
|-------|--------|----------|--------|
| `animate-slide-down` | Slide down + fade in | 0.35s | cubic-bezier(0.16, 1, 0.3, 1) |
| `animate-fade-in` | Fade in + scale | 0.3s | cubic-bezier(0.16, 1, 0.3, 1) |
| `animate-expand` | Expand from zero height | 0.3s | cubic-bezier(0.16, 1, 0.3, 1) |
| `animate-scale-up` | Scale up from center | 0.3s | cubic-bezier(0.16, 1, 0.3, 1) |
| `animate-stagger` | Staggered list items | 0.25s | 40ms delay per item |

---

## 🔥 Key Features Breakdown

### Interactive Calendar (Tasks Page)

```typescript
// Features:
- Month navigation (prev/next)
- Monday-based week grid
- Today highlight dengan green border
- Task indicator dots (green = completed, gray = pending)
- Click date → show filtered tasks for that day
- Matches tasks by dueDate (if set) or createdAt
```

### Premium Stats Charts

```typescript
// Weekly Performance Chart:
- Dual-line curve (This Week vs Last Week)
- Smooth bezier curves dengan gradient area fill
- Interactive tooltips on hover/touch
- Summary stats: Best Day, Weekly Avg, vs Last Week

// Monthly Heatmap:
- 7x5 grid dengan day numbers
- Color intensity based on completion
- Perfect Days, Current Streak, Longest Streak
```

### Focus Timer Integration

```typescript
// Linkable to:
- Meditation habit (15 min target)
- Running habit (5 km target)
- Water intake (8 glasses target)
- Workout exercises (individual exercises)
- Tasks (individual tasks)

// Auto-saves progress to Firestore on completion
```

---

## 📊 Firestore Collections

### `habits`
```typescript
{
  userId: string;
  habitType: 'meditation' | 'running';
  targetValue: number;
  logs: Array<{
    date: string;
    value: number;
    timestamp: Timestamp;
  }>;
}
```

### `tasks`
```typescript
{
  userId: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: string;
  createdAt: Timestamp;
  order: number;
}
```

### `workouts`
```typescript
{
  userId: string;
  weekId: string;
  completedExercises: string[];
  exercises: Array<{
    id: string;
    name: string;
  }>;
}
```

### `water`
```typescript
{
  userId: string;
  weekId: string;
  days: {
    [dayName: string]: {
      glasses: number;
      logs: Array<{
        amount: number;
        timestamp: Timestamp;
      }>;
    };
  };
}
```

---

## 🎯 NPM Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## 🔒 Authentication

- Firebase Authentication (Email/Password)
- Protected routes dengan middleware
- Auto redirect ke `/login` jika belum login
- Session management via Firebase Auth

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Add environment variables (Firebase config)
4. Deploy!

### Manual Deployment

```bash
npm run build
# Upload .next folder ke hosting
```

---

## 🐛 Development Tips

### Clear Firestore Data

```javascript
// Di browser console:
// (Hati-hati, ini akan hapus semua data!)
```

### Hot Reload

Perubahan code akan auto-refresh browser. Jika stuck:
```bash
# Restart dev server
npm run dev
```

### Debug Firestore

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project → Firestore Database
3. Lihat collections & documents

---

## 📝 Roadmap

- [ ] Dark/Light theme toggle
- [ ] Export data to CSV/JSON
- [ ] Habit templates
- [ ] Notifications & reminders
- [ ] Social sharing
- [ ] Multi-language support
- [ ] PWA support (offline mode)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 💖 Acknowledgments

- Design inspiration from modern productivity apps
- Icons by [Lucide](https://lucide.dev/)
- Built with ❤️ using Next.js & Firebase

---

## 📧 Contact

For questions or feedback, open an issue on GitHub.

---

**Built with 🌿 by [Your Name]**
