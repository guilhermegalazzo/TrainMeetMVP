# TrainMeet

A comprehensive, full-stack Next.js application for athletes to create, discover, and join sports events. Features include an interactive map, and location sharing starting 20 minutes before an event for confirmed participants.

## 🚀 Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Clerk
- **UI:** Tailwind CSS + shadcn/ui
- **Maps:** Mapbox GL

## 🛠 Setup & Local Development

### 1. Requirements
- Node.js (v18+)
- PostgreSQL (Remote like Neon/Supabase or Local Docker)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the respective values in `.env.local` (see `Environment Variables` section below).

### 4. Database Setup
Once your `DATABASE_URL` is set, run the Prisma migration:
```bash
npx prisma db push
# or npx prisma migrate dev --name init
```
Generate the Prisma Client:
```bash
npx prisma generate
```

### 5. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 🌎 Environment Variables (`.env.local`)
- `DATABASE_URL`: Connection string to your PostgreSQL instance.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`: Keys from your Clerk Dashboard.
- `CLERK_WEBHOOK_SECRET`: Go to Clerk -> Webhooks -> Add Endpoint (`/api/webhooks/clerk`). Subscribe to `user.created`, `user.updated`, `user.deleted`. Get the Signing Secret and place it here.
- `NEXT_PUBLIC_MAPBOX_TOKEN`: Access token from your Mapbox account.
- `NEXT_PUBLIC_APP_URL`: The URL where the application is hosted (e.g. `http://localhost:3000` for local, or your production URL).

## ▶️ Test the Flow (Demo Guide)
1. **Sign Up**: Create an account using Clerk on the web interface.
2. **Setup Event**: Navigate to "Create Event" and plan an activity. Set the privacy and location visibility.
3. **Invite Friends**: Inside the event details, search and invite other registered athletes.
4. **Accept & Track**: The invited user accepts the invitation.
5. **Live Location Window**: 20 minutes before start time, the app will begin attempting to fetch and publish coordinate pings to the API (only viewable by allowed users).

## 🚢 Deployment (Vercel)
1. Push this repository to GitHub.
2. Link the repository in Vercel.
3. Add all the Environment Variables present in `.env.local` to Vercel's Environment Variables settings.
4. Set the *Build Command* to: `npm run build && npx prisma generate`
5. Deploy!
