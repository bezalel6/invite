# Firebase Admin Management Guide

## Overview

This application now uses a simple, secure approach for managing default invitation templates. Administrators can modify default settings directly in the Firebase Realtime Database console without any authentication code in the application.

## Firebase Structure

The application reads default settings from the `/settings` path in Firebase:

```json
{
  "settings": {
    "defaultTemplate": {
      "fields": [
        {
          "id": "title",
          "type": "title",
          "value": "You are Cordially Invited",
          "visible": true,
          "locked": true
        },
        {
          "id": "subtitle", 
          "type": "subtitle",
          "value": "To attend",
          "visible": true,
          "locked": true
        },
        {
          "id": "event",
          "type": "event", 
          "value": "",
          "placeholder": "[Event Name]",
          "visible": true,
          "required": true,
          "locked": true
        },
        {
          "id": "from",
          "type": "detail",
          "value": "",
          "label": "From:",
          "placeholder": "[Your Name/Organization]",
          "visible": false
        },
        {
          "id": "location",
          "type": "detail",
          "value": "",
          "label": "Location:",
          "placeholder": "[Venue/Address]", 
          "visible": true
        },
        {
          "id": "date",
          "type": "detail",
          "value": "",
          "label": "Date:",
          "placeholder": "[Day, Month Date, Year]",
          "visible": true
        },
        {
          "id": "time",
          "type": "detail", 
          "value": "",
          "label": "Time:",
          "placeholder": "[Start Time - End Time]",
          "visible": true
        },
        {
          "id": "dresscode",
          "type": "detail",
          "value": "",
          "label": "Dress Code:",
          "placeholder": "[Formal/Casual/etc]",
          "visible": false
        },
        {
          "id": "rsvp",
          "type": "detail",
          "value": "",
          "label": "RSVP:",
          "placeholder": "[Contact Information]",
          "visible": false
        },
        {
          "id": "footer",
          "type": "footer",
          "value": "",
          "placeholder": "[Additional Information]",
          "visible": true,
          "locked": true
        }
      ],
      "lastUpdatedBy": "admin@example.com",
      "lastUpdatedAt": "2024-01-01T00:00:00.000Z"
    },
    "protectedFields": [
      "title",
      "subtitle", 
      "event",
      "footer"
    ]
  }
}
```

## Field Properties

Each field in the `defaultTemplate.fields` array can have these properties:

- **id** (string, required): Unique identifier for the field
- **type** (string, required): Field type (`title`, `subtitle`, `event`, `detail`, `footer`)
- **value** (string): Default text content for the field
- **label** (string): Display label for the field (shown in edit mode)
- **placeholder** (string): Placeholder text when field is empty
- **visible** (boolean): Whether field is visible by default in new invitations
- **required** (boolean): Whether field is required when sharing invitation
- **locked** (boolean): Whether field can be deleted by users (automatically set for protected fields)

## Protected Fields

The `protectedFields` array contains field IDs that users cannot delete when creating invitations. These fields are automatically marked as `locked: true` when the application loads.

Default protected fields: `["title", "subtitle", "event", "footer"]`

## How to Manage Settings

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the project: `invites-75e19`
3. Navigate to **Realtime Database** in the left sidebar
4. Select the database: `invites-75e19-default-rtdb`

### Step 2: Navigate to Settings

1. In the database view, look for the `/settings` path
2. If it doesn't exist, create it by clicking the **+** icon next to the root
3. Add a new child with key `settings`

### Step 3: Modify Default Template

To update field defaults:

1. Navigate to `/settings/defaultTemplate/fields`
2. Find the field you want to modify (e.g., `/settings/defaultTemplate/fields/0` for the first field)
3. Click on the field properties to edit:
   - Change `visible` to `true`/`false` to show/hide the field by default
   - Update `placeholder` text to change what users see in empty fields
   - Modify `label` to change the display name
   - Update `value` to set default content

### Step 4: Update Protected Fields

To change which fields users cannot delete:

1. Navigate to `/settings/protectedFields`
2. Add or remove field IDs from the array
3. Common field IDs: `title`, `subtitle`, `event`, `from`, `location`, `date`, `time`, `dresscode`, `rsvp`, `footer`

### Step 5: Add Metadata (Optional)

For tracking changes, you can add:

```json
{
  "lastUpdatedBy": "admin@example.com",
  "lastUpdatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Examples

### Make "From" Field Visible by Default

1. Navigate to `/settings/defaultTemplate/fields`
2. Find the field with `"id": "from"` (usually index 3)
3. Change `"visible": false` to `"visible": true`

### Change Event Placeholder Text

1. Navigate to `/settings/defaultTemplate/fields`
2. Find the field with `"id": "event"` (usually index 2)
3. Change `"placeholder": "[Event Name]"` to your preferred text

### Add New Protected Field

1. Navigate to `/settings/protectedFields`
2. Add the field ID to the array (e.g., add `"location"` to make location non-deletable)

### Remove Protection from a Field

1. Navigate to `/settings/protectedFields`
2. Remove the field ID from the array

## Fallback Behavior

If the `/settings` structure doesn't exist in Firebase, the application will use hardcoded fallback defaults:

- **Default visible fields**: title, subtitle, event, location, date, time, footer
- **Default hidden fields**: from, dresscode, rsvp
- **Default protected fields**: title, subtitle, event, footer

## Security

- Firebase Realtime Database rules control who can read/write settings
- No authentication code exists in the application 
- Admin access is controlled entirely through Firebase's own security
- All settings are read-only from the application's perspective

## Testing Changes

After modifying settings in Firebase:

1. Create a new invitation at `/create`
2. Verify that fields appear with your updated defaults
3. Check that protected fields cannot be deleted
4. Ensure placeholder text reflects your changes

Changes take effect immediately - no application restart required.

## Troubleshooting

### Settings Not Loading
- Check Firebase database rules allow read access to `/settings`
- Verify the JSON structure matches the expected format
- Check browser console for error messages

### Changes Not Visible
- Clear browser cache and refresh the page
- Verify changes were saved correctly in Firebase console
- Check that field structure includes required properties (`id`, `type`)

### Field Not Behaving as Protected
- Verify field ID is included in `/settings/protectedFields` array
- Check that field ID spelling matches exactly
- Confirm changes were saved in Firebase

## Best Practices

1. **Test changes first**: Make changes in a staging environment before production
2. **Document changes**: Use `lastUpdatedBy` and `lastUpdatedAt` fields to track modifications
3. **Backup settings**: Export current settings before making major changes
4. **Validate JSON**: Ensure all JSON is valid before saving in Firebase
5. **Monitor usage**: Check that field changes don't break existing invitations