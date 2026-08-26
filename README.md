# MERANTI REPORT

> **Kabar Meranti, Dari Kita Untuk Kita.**

Portal berita lokal profesional untuk Kepulauan Meranti. Platform publikasi berita modern yang dibangun dengan Next.js, Firebase, dan Cloudinary.

---

## Tentang Project

Meranti Report adalah platform berita lokal yang dirancang untuk menjadi media online profesional di Kepulauan Meranti, Riau. Platform ini mendukung:

- Publikasi berita dengan editor rich text
- Manajemen kategori dinamis
- Optimasi SEO dan Google News
- Responsive design (mobile-first)
- Dark mode
- Sistem breaking news
- Upload gambar via Cloudinary CDN
- Authentication berbasis role
- Admin panel / CMS profesional

---

## Tech Stack

| Teknologi | Penggunaan |
|-----------|------------|
| **Next.js 16** | Framework (App Router, Server Components) |
| **TypeScript** | Bahasa pemrograman |
| **Tailwind CSS 4** | Styling (mobile-first, responsive) |
| **shadcn/ui** | Komponen UI |
| **Firebase Auth** | Authentication |
| **Cloud Firestore** | Database NoSQL |
| **Cloudinary** | Image CDN, upload, transformasi |
| **TipTap** | Rich text editor |
| **next-themes** | Dark mode |
| **Lucide React** | Icons |

---

## Struktur Project

```
meranti-report/
├── app/
│   ├── admin/              # Admin panel pages
│   │   ├── layout.tsx      # Admin layout (sidebar, auth guard)
│   │   ├── page.tsx        # Dashboard
│   │   ├── login/          # Admin login
│   │   ├── berita/         # Article management (list, create, edit)
│   │   ├── kategori/       # Category management
│   │   ├── media/          # Media library
│   │   ├── author/         # Author management
│   │   ├── komentar/       # Comment moderation
│   │   ├── analytics/      # Analytics dashboard
│   │   └── settings/       # Site settings
│   ├── berita/[slug]/      # Article detail page
│   ├── kategori/[slug]/    # Category page
│   ├── search/             # Search results
│   ├── api/                # API routes
│   │   ├── articles/       # Article CRUD + search
│   │   ├── categories/     # Category CRUD
│   │   ├── media/          # Media management
│   │   ├── upload/         # Image upload
│   │   ├── auth/           # Authentication
│   │   ├── settings/       # Site settings
│   │   ├── views/          # View counter
│   │   ├── search/         # Search
│   │   ├── authors/        # Author management
│   │   ├── comments/       # Comments
│   │   ├── analytics/      # Analytics data
│   │   └── seed/           # Database seeder
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── sitemap.ts          # Dynamic sitemap
│   ├── robots.ts           # Robots.txt
│   ├── not-found.tsx       # 404 page
│   ├── error.tsx           # Error boundary
│   └── loading.tsx         # Global loading
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Header, Footer, BreakingNews, Theme
│   ├── news/               # News cards, hero, grid, share, etc.
│   ├── admin/              # Admin-specific components
│   ├── editor/             # TipTap editor components
│   └── seo/                # JSON-LD schemas
├── lib/
│   ├── firebase/           # Firebase client + admin config
│   ├── cloudinary.ts       # Cloudinary integration
│   ├── seo.ts              # SEO helpers + schema generators
│   ├── mock-data.ts        # Demo/fallback data
│   ├── api-helpers.ts      # API utilities
│   └── utils.ts            # General utilities
├── hooks/
│   └── use-auth.tsx        # Auth context + hook
├── types/
│   └── index.ts            # TypeScript type definitions
├── public/
│   └── icons/              # Static assets
├── scripts/                # Utility scripts
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore composite indexes
├── .env.example            # Environment variable template
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Installation

### Prerequisites

- Node.js 18+ atau Bun
- Akun Firebase (Firebase Console)
- Akun Cloudinary

### Langkah-langkah

1. **Clone repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/meranti-report.git
   cd meranti-report
   ```

2. **Install dependencies**
   ```bash
   npm install
   # atau
   bun install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Isi nilai di `.env.local` (lihat bagian Environment Variables di bawah).

4. **Jalankan development server**
   ```bash
   npm run dev
   # atau
   bun run dev
   ```

5. **Buka** `http://localhost:3000`

6. **Seed data (opsional, untuk demo)**
   ```bash
   npm run seed
   # atau
   curl -X POST http://localhost:3000/api/seed \
     -H 'Content-Type: application/json' \
     -d '{"seedKey":"meranti-seed-2025"}'
   ```

---

## Firebase Setup

### 1. Buat Project Firebase

1. Pergi ke [Firebase Console](https://console.firebase.google.com/)
2. Buat project baru: "Meranti Report"
3. Aktifkan **Authentication** > Sign-in method > **Email/Password**
4. Aktifkan **Cloud Firestore** > Create database (start in production mode)

### 2. Dapatkan Konfigurasi

1. Di Project Settings > General > Your apps > Web app
2. Daftarkan app dan salin konfigurasi `firebaseConfig`
3. Isi nilai di `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

### 3. Service Account (untuk Admin SDK)

1. Di Project Settings > Service accounts
2. Klik "Generate new private key"
3. Simpan file JSON tersebut
4. Set environment variable:
   ```bash
   export FIREBASE_SERVICE_ACCOUNT_KEY="$(cat path/to/service-account-key.json)"
   ```
   Atau copy isi file JSON ke env variable `FIREBASE_SERVICE_ACCOUNT_KEY`.

### 4. Deploy Firestore Rules

1. Di Firestore Database > Tab Rules
2. Copy isi file `firestore.rules` ke console
3. Klik Publish

### 5. Deploy Firestore Indexes

1. Di Firestore Database > Tab Indexes
2. Klik "Create composite index" atau gunakan Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase deploy --only firestore:indexes
   ```

---

## Cloudinary Setup

1. Daftar di [Cloudinary](https://cloudinary.com/)
2. Di Dashboard, salin:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Isi di `.env.local`:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

---

## Environment Variables

Salin dari `.env.example` ke `.env.local` dan isi:

```env
# Firebase (Public - safe untuk client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin (Server-side only - JANGAN commit)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Cloudinary (Server-side)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Site
NEXT_PUBLIC_SITE_URL=https://merantireport.com

# GitHub Token (hanya untuk setup repo, tidak diperlukan runtime)
GITHUB_TOKEN=
```

---

## Membuat Akun Admin

### Cara 1: Melalui Firebase Console

1. Buka Firebase Console > Authentication > Users
2. Klik "Add user"
3. Masukkan email dan password
4. Di Firestore, buat document di collection `users` dengan ID = user UID:
   ```json
   {
     "email": "admin@merantireport.com",
     "displayName": "Admin Meranti",
     "photoURL": "",
     "role": "super_admin",
     "createdAt": "2025-01-01T00:00:00.000Z",
     "updatedAt": "2025-01-01T00:00:00.000Z"
   }
   ```

### Cara 2: Menggunakan Firebase CLI

```bash
firebase auth:create-user --email admin@merantireport.com --password YourSecurePassword
```
Kemudian buat document user di Firestore seperti di atas.

### User Roles

| Role | Akses |
|------|-------|
| `super_admin` | Akses penuh (semua fitur admin) |
| `editor` | Kelola berita, kategori, media, komentar |
| `author` | Buat & edit berita miliknya, upload media |

---

## Build Production

```bash
npm run build
```

Jalankan production server:

```bash
npm run start
```

---

## Deploy

### Vercel (Recommended)

1. Push ke GitHub
2. Connect repository di [Vercel](https://vercel.com/)
3. Set environment variables di Vercel dashboard
4. Deploy

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Self-hosted

```bash
npm run build
npm run start
```

---

## Keamanan

- Tidak ada credential/secret di source code
- `.env` dan `.env.local` di `.gitignore`
- Firebase Admin SDK hanya di server-side
- Firestore security rules membatasi akses berdasarkan role
- Cloudinary API Secret tidak terekspos ke client
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)

---

## SEO Features

- Dynamic metadata per halaman
- Open Graph tags
- Twitter/X Card tags
- JSON-LD schemas (NewsArticle, BreadcrumbList, Organization, WebSite)
- Dynamic sitemap.xml
- robots.txt
- SEO-friendly URLs (`/berita/judul-berita`)
- Canonical URLs
- Google News compatible structure

---

## Default Categories

Meranti, Selatpanjang, Tebing Tinggi, Tebing Tinggi Barat, Tebing Tinggi Timur, Rangsang, Rangsang Pesisir, Merbau, Pulau Merbau, Tasik Putri Puyu, Pemerintahan, Politik, Hukum, Ekonomi, Pendidikan, Kesehatan, Sosial, Olahraga, Peristiwa, Lingkungan, Teknologi, Nasional

---

## License

MIT
