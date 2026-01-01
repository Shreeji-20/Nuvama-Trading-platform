my-next-app/
├── app/
│   ├── api/               # Next.js API routes
│   │   └── auth/          # Authentication endpoints
│   │       └── route.ts
│   ├── dashboard/         # Page route: /dashboard
│   │   └── page.tsx
│   ├── login/             # Page route: /login
│   │   └── page.tsx
│   ├── layout.tsx         # Root layout (shared wrapper)
│   └── globals.css        # Global CSS
├── components/            # Reusable React components
│   ├── Button.tsx
│   ├── Navbar.tsx
│   └── Modal.tsx
├── hooks/                 # Custom React hooks
│   └── useAuth.ts
├── lib/                   # Utilities, API clients, helpers
│   └── axiosClient.ts
├── context/               # React context providers (Auth, Theme)
│   └── AuthContext.tsx
├── types/                 # TypeScript types / interfaces
│   └── user.ts
├── public/                # Static assets (images, favicon)
│   └── logo.png
├── styles/                # Component or page-specific CSS / Tailwind config
│   └── button.css
├── package.json
├── tsconfig.json
└── next.config.js
