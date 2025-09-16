# Admin Panel Setup Guide

## Overview
The admin panel allows authorized users to manage default invitation templates and protected fields. It uses Vercel's built-in authentication combined with environment variables for access control.

## Setup Steps

### 1. Enable Vercel Authentication

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Deployment Protection**
3. Under **Vercel Authentication**, select:
   - `Only Preview Deployments` to protect just preview URLs
   - `All Deployments` to protect production too (recommended for /admin route)
4. Click **Enable**

### 2. Configure Admin Emails

1. In Vercel Dashboard, go to **Settings** → **Environment Variables**
2. Add a new environment variable:
   - **Key**: `ADMIN_EMAILS`
   - **Value**: Comma-separated list of admin emails (e.g., `admin1@example.com,admin2@example.com`)
   - **Target**: Production, Preview, Development
3. Click **Save**

### 3. Protect the Admin Route (Optional)

If you want to protect only the `/admin` route and not the entire site:

1. Update `vercel.json` to add authentication to specific routes:

```json
{
  "functions": {
    "api/admin-*.js": {
      "includeFiles": "api/admin-*.js"
    }
  },
  "rewrites": [
    {
      "source": "/admin",
      "destination": "/index.html",
      "has": [
        {
          "type": "header",
          "key": "x-vercel-authenticated-user"
        }
      ]
    }
  ]
}
```

### 4. Deploy Changes

```bash
git add .
git commit -m "Add admin panel with Vercel authentication"
git push origin master
```

## How It Works

1. **Vercel Authentication**: When enabled, Vercel requires users to log in with their Vercel account
2. **Admin Check**: The `/api/admin-check` endpoint verifies if the logged-in user's email is in the `ADMIN_EMAILS` list
3. **Protected API**: The `/api/admin-update` endpoint only accepts requests from authenticated admins
4. **Admin Panel**: The `/admin` page shows management interface only to authorized users

## Admin Panel Features

### Default Template Management
- Configure which fields appear in new invitations
- Set field visibility and required status
- Customize placeholder text

### Protected Fields
- Mark fields that users cannot delete
- Ensures critical invitation information is always present

## Testing

1. Navigate to `https://your-domain.vercel.app/admin`
2. Log in with your Vercel account
3. If your email is in `ADMIN_EMAILS`, you'll see the admin panel
4. Otherwise, you'll see an "Access Denied" message

## Security Notes

- Admin emails are stored in environment variables, not in code
- Authentication is handled by Vercel's infrastructure
- API endpoints verify admin status on every request
- Firebase updates include audit trail (who updated and when)

## Troubleshooting

### "Access Denied" despite being admin
- Ensure your email in `ADMIN_EMAILS` matches your Vercel account email exactly
- Check that environment variables are deployed (may need to redeploy)
- Verify Vercel Authentication is enabled in project settings

### API returns "Not authenticated"
- Confirm Vercel Authentication is enabled
- Check that you're logged in to Vercel
- Clear browser cache and cookies, then log in again

### Changes not saving
- Verify Firebase database rules allow writes to `/settings` path
- Check browser console for specific error messages
- Ensure API endpoints are deployed correctly

## Alternative: Password Protection

If you prefer simple password protection instead of Vercel Authentication:

1. Set a password in Vercel Dashboard under **Deployment Protection** → **Password Protection**
2. Share the password with admins only
3. Modify API endpoints to check for password in headers instead of email

## Firebase Structure

The admin panel manages data in this structure:

```json
{
  "settings": {
    "defaultTemplate": {
      "fields": [...],
      "theme": {...},
      "lastUpdatedBy": "admin@example.com",
      "lastUpdatedAt": "2024-01-01T00:00:00.000Z"
    },
    "protectedFields": ["event", "from"]
  }
}
```

## Next Steps

1. Add more admin features as needed
2. Consider implementing role-based access (super admin, moderator, etc.)
3. Add logging and analytics for admin actions
4. Create backup/restore functionality for templates