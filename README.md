# AlphaLink v2 - Private Trading Research Community

AlphaLink v2 is a high-performance web application designed for private trading communities. It features a institutional-grade research feed for stocks and options, performance tracking, and an AI research assistant.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS (Bloomberg/TradingView theme)
- **AI Engine**: Google Gemini API via Genkit Flows
- **UI Components**: Shadcn UI (Radix Primitives)
- **State/Auth**: MVP uses `localStorage` session persistence with access code validation.

## Quick Start (Development)

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root:
   ```env
   GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
   ```

3. **Launch Terminal**
   ```bash
   npm run dev
   ```
   Open [http://localhost:9002](http://localhost:9002)

4. **First-Time Login (Admin)**
   Use the bootstrap code: `ALPHALINK_ADMIN_888`

## Features & Roles

### 👑 Administrator
- **Invite Management**: Generate unique invitation codes for members.
- **Trade Desk**: Post Stock or Options trade ideas with real-time AI summarization.
- **Wall of Fame**: Manage performance highlights and win entries.

### 💎 Member
- **Research Feed**: Access all institutional trade notes and AI summaries.
- **AlphaBot AI**: Chat with a specialized trading research assistant.
- **Performance Feed**: View verified desk results.

## Deployment Steps

1. **Firebase Configuration**
   Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   Select: Hosting, Firestore (if moving beyond MVP), Functions.

2. **Deploy to Hosting**
   ```bash
   npm run build
   # If using Firebase Hosting
   firebase deploy --only hosting
   ```

## Firestore Security Rules (Production Ready)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper: Is the user authenticated?
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper: Is the user an admin?
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /tradeIdeas/{ideaId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
      
      match /likes/{userId} {
        allow read: if isAuthenticated();
        allow create: if request.auth.uid == userId;
        allow delete: if request.auth.uid == userId;
      }
    }

    match /highlights/{highlightId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    match /chats/{userId}/messages/{msgId} {
      allow read, write: if request.auth.uid == userId;
    }

    match /invites/{inviteId} {
      allow read, write: if isAdmin();
    }
  }
}
```

## Manual Test Checklist
1. [ ] Enter site using `ALPHALINK_ADMIN_888`.
2. [ ] Navigate to **Invites** and generate a member code.
3. [ ] Logout and login using that member code.
4. [ ] Post a Stock trade idea as Admin; verify AI summary generates correctly.
5. [ ] Post an Options vertical spread as Admin.
6. [ ] Chat with AlphaBot in the **Assistant** tab.
7. [ ] Add a performance highlight and verify it appears in the grid.

---
*For educational purposes only. Not financial advice.*