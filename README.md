# Kids Attendance Tracker

A modern web application for tracking attendance in kids ministry programs, built with Next.js 15 and React 19.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **UI**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Kinde Auth](https://kinde.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Data Grid**: [AG Grid](https://www.ag-grid.com/)

## 🚀 Getting Started

Prerequisites:
- Node.js LTS >= 18
- pnpm (package manager)

Setup:
```bash
pnpm install
cp .env.local.example .env.local # then edit values
```

Database:
```bash
# Push latest schema to your MySQL database
pnpm db:push

# Open Drizzle Studio (requires DATABASE_URL)
pnpm db:studio
```

Run the development server:
```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

Troubleshooting:
- Drizzle/MySQL permissions: ensure your DB user has CREATE/ALTER privileges; verify DATABASE_URL points to the correct database.
- If db:studio fails, check that MySQL is running and DATABASE_URL is set in .env.local.

### Path Aliases
This project uses an absolute import alias `@/` that maps to the repository root (see tsconfig.json and Jest configs).

Examples:
```ts
import { Kids } from '@/utils/schema';
import AttendanceGrid from '@/app/dashboard/attendance/_components/AttendanceGrid';
```

## ✨ Features

- Track attendance by age group
- Visualize attendance data with charts
- Manage kids' information
- User authentication and authorization
- Responsive design for all devices

## 🧹 Code Style

We use Prettier for formatting and ESLint for linting.

- Check format: pnpm format
- Write format: pnpm format:write
- Lint: pnpm lint

## 🗄 Database Commands

```bash
# Push schema changes to the database
pnpm db:push

# Open Drizzle Studio to manage database
pnpm db:studio
```

## 📚 Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deployment

This app can be deployed to [Vercel](https://vercel.com/) or any platform that supports Next.js with minimal configuration.
