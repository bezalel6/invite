# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based invitation creation and sharing application that allows users to create customizable event invitations with fully editable fields (title, subtitle, event name, location, date, time, and footer). Invitations are stored in Firebase Realtime Database and can be shared via unique URLs.

## Architecture

### Routing System
The app uses path-based routing (`/invite/id`) with BrowserRouter for all navigation:
- **Client-side routing**: BrowserRouter handles all navigation
- **Server-side handling**: Vercel Edge Functions detect crawlers and serve appropriate content

### Key Components

**Frontend (React SPA)**
- `src/App.jsx`: Main app using BrowserRouter for client-side routing
- `src/components/InviteCard.jsx`: Core component handling invitation display/editing with complex state management for editable fields (object structure with `value`, `label`, and `placeholder` properties)
- Firebase integration for data persistence using REST API directly (no SDK)

**Backend (Vercel Edge Functions)**
- `api/og.js`: Server-side rendering for social media crawlers
  - Detects crawler user agents (Facebook, Twitter, LinkedIn, etc.)
  - Fetches invitation data from Firebase server-side
  - Generates proper Open Graph and Twitter Card meta tags
  - Serves React app for human visitors via rewrite

### Data Structure
Invitations are stored with nested object fields:
```javascript
{
  title: { value: 'You are Cordially Invited' },
  subtitle: { value: 'To attend' },
  event: { value: '', placeholder: '[Event Name]' },
  location: { value: '', label: 'Location:', placeholder: '[Venue/Address]' },
  // ... etc
}
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (Vite)
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Deployment

Deployed on Vercel with automatic deployments from GitHub. The `vercel.json` configuration handles:
- Rewriting `/invite/:id` routes to Edge Function for crawlers
- Serving static files for all other routes
- Caching headers for performance

## Testing Social Media Previews

After making changes to meta tags or Edge Functions:

1. Deploy to Vercel (auto-deploys on push to master)
2. Test with Facebook Debugger: https://developers.facebook.com/tools/debug/
3. Test with Twitter Card Validator: https://cards-dev.twitter.com/validator
4. Use URL format: `https://invite.rndev.site/invite/[id]`

For detailed testing instructions, see `SOCIAL_PREVIEW_TESTING.md`.

## Firebase Configuration

- Database: `https://invites-75e19-default-rtdb.firebaseio.com`
- No authentication required (public read/write)
- Invitations stored at `/invites/{id}`
- ID generation uses content hashing for deduplication

## Critical Implementation Details

### Editable Fields System
All text elements (including title, subtitle, and labels) are editable in create mode. The component uses a complex rendering system:
- Editable mode: Renders styled input fields that look like plain text
- View mode: Renders standard HTML elements
- CSS classes handle the seamless transition between states

### Social Media Preview Implementation
Social media crawlers don't execute JavaScript, so the solution involves:
- **Vercel rewrites** with user-agent detection in `vercel.json`
- **API function** (`/api/og.js`) generates HTML with meta tags for crawlers
- **Crawler detection** checks user-agent and returns 404 for non-bots (letting Vercel serve the React app)
- **Human visitors** get the React SPA through catch-all rewrite rule

### URL Structure
All URLs use path-based routing (`/invite/id`):
- **No hash routing** - BrowserRouter handles all client-side routing
- **Consistent URLs** - Same format for sharing and navigation
- **Clean URLs** - No `#` symbols anywhere in the application

### Critical Implementation Note
The API function (`/api/og.js`) must return 404 for non-bot requests. Do NOT use `res.rewrite()` as it's not available in standard Vercel functions - this will cause a crash. The 404 response allows Vercel's catch-all rewrite rule to serve the React app properly.

## Known Edge Cases

1. **Empty Fields**: The Edge Function handles both old format (plain strings) and new format (objects with value property)
2. **Special Characters**: HTML escaping is implemented in the Edge Function to prevent XSS
3. **Cache Busting**: Social platforms cache aggressively - use query params (`?v=2`) to force refresh