# DailyFlow - Personal Productivity App

Aplikasi produktivitas all-in-one yang dibangun dengan Next.js, TypeScript, dan TailwindCSS.

## 🎯 Login Credentials

```
Username: zen
Password: zen 123
```

## ✨ Features

- 🔐 **Local Authentication** - Login sederhana tanpa database
- ✅ **Smart To-Do List** - Create, edit, delete, prioritize, dan drag & drop tasks
- ⏰ **Pomodoro Timer** - Focus sessions dengan preset durasi dan auto-break
- 💪 **Workout Planner** - Daily workout checklist dengan progress tracking
- 📱 **Mobile-First UI** - Responsive design dengan bottom navigation
- 💾 **localStorage** - Data disimpan di browser, tidak perlu database
- ⚡ **Skeleton Loading** - Smooth loading experience

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 3. Login

Gunakan credentials:
- **Username**: zen
- **Password**: zen 123

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Storage**: localStorage (Browser)
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Drag & Drop**: @hello-pangea/dnd
- **Icons**: Lucide React
- **Date Utilities**: date-fns

## 📁 Project Structure

```
app/
├── login/              # Halaman login
├── dashboard/          # Protected dashboard routes
│   ├── tasks/         # Task management
│   ├── focus/         # Pomodoro timer
│   └── workout/       # Workout planner

components/
├── layout/            # Header, BottomNav
├── tasks/             # Task components
├── focus/             # Timer components
├── workout/           # Workout components
└── ui/                # Reusable UI (Button, Input, Skeleton, dll)

store/
├── taskStore.ts       # Task state (Zustand + localStorage)
├── timerStore.ts      # Timer state
└── workoutStore.ts    # Workout state (Zustand + localStorage)

hooks/
├── useAuth.tsx        # Authentication logic
└── useTimer.ts        # Timer hook
```

## 🎨 Features Breakdown

### Tasks
- ✅ Create, edit, delete tasks
- ✅ Priority badges (high/medium/low)
- ✅ Drag & drop reordering
- ✅ Filter by priority
- ✅ Due date tracking
- ✅ Skeleton loading state

### Focus Timer
- ✅ Preset durations (15, 25, 45 minutes)
- ✅ Start, pause, reset
- ✅ Auto 5-minute break
- ✅ Link to task
- ✅ Session counter
- ✅ Sandglass animation

### Workout Planner
- ✅ Add workouts
- ✅ Toggle completion
- ✅ Progress bar
- ✅ Skeleton loading state

## 💾 Data Storage

Data disimpan di **localStorage browser**:
- `dailyflow_tasks` - Semua tasks
- `dailyflow_workouts` - Semua workouts
- `user` - Session user

**Note**: Data akan hilang jika localStorage dibersihkan atau menggunakan browser berbeda.

## 🎯 NPM Scripts

```bash
npm run dev      # Start development server
npm run build    # Build untuk production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 📱 Responsive Design

- **Mobile**: Bottom tab navigation
- **Desktop**: Top header navigation
- Touch-friendly buttons
- Optimized untuk semua screen sizes

## 🔒 Authentication

- Username & password hardcoded: `zen` / `zen 123`
- Session disimpan di localStorage
- Auto redirect jika belum login
- Protected routes

## 🎨 UI Features

- **Skeleton Loading** - Smooth placeholder loading
- Empty states dengan icons
- Color-coded priority badges
- Smooth animations
- Modern gradient backgrounds
- Clean, minimal design

## 🐛 Development

### Clear Data

Untuk reset semua data:
1. Buka Browser DevTools (F12)
2. Tab Application/Storage
3. Clear localStorage untuk localhost:3000

### Hot Reload

Perubahan code akan auto-refresh browser.

## 📝 License

MIT

---

Built with ❤️ using modern web technologies
