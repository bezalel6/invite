# Firebase Setup Guide

## Initial Setup

### 1. Authenticate with Firebase
```bash
npm run firebase:login
```
This opens a browser for Google authentication.

### 2. Initialize Default Settings
```bash
npm run firebase:init-settings
```
This uploads the default invitation template to Firebase.

### 3. Deploy Security Rules
```bash
npm run firebase:deploy-rules
```
This deploys the database security rules that:
- Allow public read/write for invitations
- Require authentication for settings modifications
- Validate data structure

## Firebase Security Rules

The project includes security rules in `database.rules.json`:

### Invitations (`/invites`)
- **Read**: Public (anyone can view invitations)
- **Write**: Public (anyone can create invitations)
- **Validation**: Must have `fields` and `createdAt`

### Settings (`/settings`)
- **Read**: Public (app needs to read defaults)
- **Write**: Authenticated users only
- **Validation**: Must follow template structure

## Available Scripts

| Command | Description |
|---------|------------|
| `npm run firebase:login` | Authenticate with Firebase |
| `npm run firebase:init-settings` | Initialize default settings |
| `npm run firebase:deploy-rules` | Deploy security rules |
| `npm run firebase:rules-local` | Test rules locally |
| `npm run firebase:emulator` | Run Firebase emulator |

## Managing Settings

### Via Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/project/invites-75e19/database/invites-75e19-default-rtdb/data)
2. Navigate to `/settings`
3. Edit JSON directly

### Via REST API (Authenticated)
```bash
# Get current settings
curl https://invites-75e19-default-rtdb.firebaseio.com/settings.json

# Update settings (requires auth token)
curl -X PUT \
  'https://invites-75e19-default-rtdb.firebaseio.com/settings.json?auth=YOUR_TOKEN' \
  -d @new-settings.json
```

## Security Configuration

To enable authenticated writes to `/settings`:

1. **Generate a Firebase Admin SDK key**:
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Keep this secure!

2. **Use Firebase Admin SDK** (for server-side updates):
   ```javascript
   const admin = require('firebase-admin');
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),
     databaseURL: "https://invites-75e19-default-rtdb.firebaseio.com"
   });
   ```

3. **Or use Firebase Auth** (for client-side):
   - Enable Authentication in Firebase Console
   - Add authorized users
   - Use Firebase Auth SDK in admin tools

## Database Structure

```json
{
  "invites": {
    "[inviteId]": {
      "fields": [...],
      "createdAt": "ISO-8601 timestamp"
    }
  },
  "settings": {
    "defaultTemplate": {
      "fields": [
        {
          "id": "string",
          "value": "string", 
          "label": "string",
          "placeholder": "string",
          "visible": boolean,
          "editable": boolean
        }
      ],
      "theme": {
        "primaryColor": "#hexcolor",
        "backgroundColor": "#hexcolor",
        "textColor": "#hexcolor"
      }
    },
    "protectedFields": ["field_ids"],
    "features": {
      "allowCustomFields": boolean,
      "requireEventName": boolean
    }
  }
}
```

## Testing Rules Locally

1. Start the Firebase emulator:
   ```bash
   npm run firebase:emulator
   ```

2. The emulator runs at `http://localhost:9000`

3. Update your app to use the emulator:
   ```javascript
   const dbUrl = process.env.NODE_ENV === 'development' 
     ? 'http://localhost:9000' 
     : 'https://invites-75e19-default-rtdb.firebaseio.com';
   ```

## Troubleshooting

### "Permission Denied" on Settings Write
- Settings require authentication
- Use Firebase Console to edit manually
- Or implement Firebase Auth for programmatic access

### Rules Not Applying
- Run `npm run firebase:deploy-rules`
- Check Firebase Console → Database → Rules tab
- Ensure `.firebaserc` has correct project ID

### Can't Initialize Settings
- Check network connection
- Verify Firebase project exists
- Ensure database URL is correct