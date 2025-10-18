# LMS Frontend

A modern React frontend for the Learning Management System built with Vite, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: Login/Register with JWT tokens and Google OAuth
- **Role-based Access**: Student and Teacher dashboards
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **TypeScript**: Full type safety
- **React Query**: Efficient data fetching and caching

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

4. Start development server:
```bash
npm run dev
```

## Environment Variables

- `VITE_API_URL`: Backend API URL (default: http://localhost:5000/api)
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ProtectedRoute.tsx
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── lib/                 # Utility functions
│   ├── api.ts          # API client
│   └── auth.ts         # Auth utilities
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Register.tsx   # Registration page
│   └── ...
└── App.tsx            # Main app component
```

## Authentication

The app uses JWT tokens for authentication with the following flow:

1. User logs in with email/password or Google OAuth
2. Backend returns JWT token
3. Token is stored in localStorage
4. Token is included in API requests
5. Protected routes check for valid token

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173` (development)
   - Your production domain
6. Copy the Client ID to your `.env` file

## API Integration

The frontend integrates with the LMS backend API:

- **Authentication**: `/api/auth/*`
- **Courses**: `/api/courses/*`
- **Assignments**: `/api/assignments/*`
- **Submissions**: `/api/submissions/*`
- **Grades**: `/api/grades/*`
- **Plagiarism**: `/api/plagiarism/*`

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Routing
- **React Query** - Data fetching
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client