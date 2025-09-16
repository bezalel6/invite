# Social Media Preview Testing Guide

## What Was Fixed

### Previous Issues:
- ❌ Social media crawlers couldn't see invitation data (JavaScript-dependent)
- ❌ Hash routing (#/invite/123) was ignored by crawlers
- ❌ All shared links showed the same generic preview

### Solution Implemented:
- ✅ Vercel Edge Function generates proper meta tags server-side
- ✅ Path-based URLs (/invite/123) for social sharing
- ✅ Automatic crawler detection and dynamic HTML generation
- ✅ Backward compatibility with existing hash-based links

## How It Works

1. **When a user shares a link**: They get `/invite/123` (no hash)
2. **When a crawler visits**: Vercel Edge Function serves HTML with proper meta tags
3. **When a human visits**: JavaScript redirects to React app with hash routing
4. **Data source**: Firebase data is fetched server-side for crawlers

## Testing Your Implementation

### 1. Local Testing (Limited)
```bash
# Test the API endpoint locally
curl http://localhost:5173/api/og?id=YOUR_INVITE_ID

# Check if meta tags are present in response
```

### 2. Deploy to Vercel
```bash
# Commit and push changes
git add -A
git commit -m "Fix: Add server-side rendering for social media previews"
git push

# Vercel will auto-deploy from your GitHub repo
```

### 3. Test with Social Media Debuggers

#### Facebook Sharing Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your invitation URL: `https://invite.rndev.site/invite/YOUR_ID`
3. Click "Debug"
4. Check that it shows:
   - Correct event name as title
   - Event details in description
   - Logo image
   - No errors or warnings

#### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your invitation URL: `https://invite.rndev.site/invite/YOUR_ID`
3. Click "Preview card"
4. Verify the card shows correct information

#### LinkedIn Post Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your URL and inspect

### 4. Test User Flow

1. **Create a new invitation**:
   - Go to https://invite.rndev.site
   - Fill in event details
   - Click "Generate Share Link"
   - Verify link is copied as `/invite/123` (not `/#/invite/123`)

2. **Test the shared link**:
   - Open in incognito/private browser
   - Should redirect to `/#/invite/123` and show invitation
   - Share on social media and verify preview

3. **Test backward compatibility**:
   - Old links (`/#/invite/123`) should still work
   - New links (`/invite/123`) should work for both crawlers and users

## Troubleshooting

### Preview Not Updating?
- Facebook caches previews aggressively
- Use "Scrape Again" button in Facebook Debugger
- Add `?v=2` to URL to force re-scrape

### Wrong Data Showing?
- Check Firebase has correct data: 
  ```
  https://invites-75e19-default-rtdb.firebaseio.com/invites/YOUR_ID.json
  ```
- Verify Edge Function is deployed in Vercel dashboard

### Crawler Detection Not Working?
- Check Vercel Function logs for errors
- Ensure `api/og.js` is properly deployed
- Test with curl using crawler User-Agent:
  ```bash
  curl -H "User-Agent: facebookexternalhit/1.1" https://invite.rndev.site/invite/YOUR_ID
  ```

## URL Structure

### For Sharing (Social Media Compatible):
```
https://invite.rndev.site/invite/abc123
```

### Internal Navigation (React Router):
```
https://invite.rndev.site/#/invite/abc123
```

Both work, but only the first one generates proper social previews!

## Security Considerations

- ✅ HTML escaping implemented for all user input
- ✅ Firebase data validated before rendering
- ✅ Rate limiting via Vercel (automatic)
- ✅ Caching headers to reduce load