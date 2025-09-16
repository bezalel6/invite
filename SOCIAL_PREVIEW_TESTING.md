# Social Media Preview Testing Guide

## Architecture Overview

### Current Implementation
- ✅ **Path-based routing only** (`/invite/123`) - No hash routing anywhere
- ✅ **BrowserRouter** for React client-side routing
- ✅ **Vercel Edge Function** for generating meta tags for crawlers
- ✅ **Automatic crawler detection** via user-agent headers

### How It Works

1. **User shares a link**: `https://invite.rndev.site/invite/123`
2. **Vercel checks the request**:
   - **If crawler** (detected by user-agent): Routes to `/api/og?id=123`
   - **If human**: Serves React app via catch-all rewrite rule
3. **API Function** (`/api/og.js`):
   - Fetches invitation data from Firebase
   - Generates HTML with proper Open Graph and Twitter Card tags
   - Returns HTML for crawlers only
4. **React App**:
   - Uses BrowserRouter for all navigation
   - No hash routing anywhere in the codebase

## Testing Your Implementation

### 1. Local Testing
```bash
# Run development server
npm run dev

# Test creating an invitation
# Should navigate to /invite/[id] (no hash)
```

### 2. Deploy to Vercel
```bash
# Commit and push changes
git add -A
git commit -m "Your commit message"
git push

# Vercel auto-deploys from GitHub
```

### 3. Test with Social Media Debuggers

#### Facebook Sharing Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your invitation URL: `https://invite.rndev.site/invite/YOUR_ID`
3. Click "Debug"
4. Verify it shows:
   - Event name as title
   - Event details in description
   - Logo image
   - Proper URL (no hash)

#### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your invitation URL: `https://invite.rndev.site/invite/YOUR_ID`
3. Click "Preview card"
4. Verify the card displays correctly

#### LinkedIn Post Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your URL and inspect

### 4. Test User Flow

1. **Create a new invitation**:
   - Go to https://invite.rndev.site
   - Fill in all fields (including title, subtitle, labels)
   - Click "Generate Share Link"
   - Verify URL is `/invite/123` (NO hash)

2. **Test the shared link**:
   - Open in new browser/incognito
   - Should load directly at `/invite/123`
   - All data should display correctly

3. **Test crawler behavior**:
   ```bash
   # Test with crawler user-agent
   curl -H "User-Agent: facebookexternalhit/1.1" \
        https://invite.rndev.site/invite/YOUR_ID
   
   # Should return HTML with meta tags
   ```

## Troubleshooting

### Preview Not Updating?
- Facebook caches previews aggressively
- Use "Scrape Again" button in Facebook Debugger
- Add query param to force refresh: `?v=2`

### Wrong Data Showing?
- Verify Firebase has correct data: 
  ```
  https://invites-75e19-default-rtdb.firebaseio.com/invites/YOUR_ID.json
  ```
- Check Vercel Function logs for errors
- Ensure the data structure matches (objects with `value` property)

### Function Errors?
- Check Vercel dashboard for function logs
- Common issues:
  - Invalid Firebase response
  - Malformed invitation data
  - Network timeouts

## Technical Details

### Vercel Configuration (`vercel.json`)
```json
{
  "rewrites": [
    {
      "source": "/invite/:id",
      "has": [{ 
        "type": "header", 
        "key": "user-agent", 
        "value": ".*(facebookexternalhit|Twitterbot|...).*" 
      }],
      "destination": "/api/og?id=:id"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Crawler Detection
The API function detects these crawlers:
- facebookexternalhit (Facebook)
- Twitterbot (Twitter/X)
- LinkedInBot (LinkedIn)
- WhatsApp
- Slackbot (Slack)
- Discordbot (Discord)
- TelegramBot (Telegram)

### Data Structure
Invitations support both formats:
- **New format**: `{ value: "text", label: "Label:", placeholder: "[hint]" }`
- **Legacy format**: Simple strings (for backwards compatibility)

## Security Considerations

- ✅ HTML escaping for all user input in meta tags
- ✅ Firebase data validation before rendering
- ✅ Rate limiting via Vercel (automatic)
- ✅ Caching headers for performance (1 hour cache)