# Branch Links Seeder

This seeder will generate Branch.io deep links for all events that are missing them.

## What it does

The seeder will:
1. Find all events that have a null or empty `branchLink` field
2. Generate a Branch.io deep link for each event using the `generateBranchLink` utility
3. Update each event with the generated branch link
4. Process events in batches of 10 to avoid overwhelming the Branch API
5. Add a 1-second delay between batches to be respectful to the API

## How to run

### Automatic execution
The seeder will run automatically when the events service starts up, along with the other seeders.

### Manual execution
You can run the seeder manually using the npm script:

```bash
npm run seed:branch-links
```

Or directly with ts-node:

```bash
ts-node src/scripts/seed-branch-links.ts
```

## Implementation details

The seeder uses the same logic as the event creation process:
- Creates web URLs with the format: `{RUMOR_WEBSITE_HOST}/events/event-details?id={eventId}`
- Creates deep link paths with the format: `events/event-details?id={eventId}`
- Sets up Branch.io data with iOS, Android, and desktop URLs
- Uses the event name in the marketing title: `Event: {eventName}`

## Configuration

The seeder requires the following environment variables:
- `RUMOR_WEBSITE_HOST`: The base URL for web fallbacks
- `BRANCH_API_KEY`: Your Branch.io API key

## Error handling

The seeder will:
- Log successful branch link generations with ✅
- Log errors for individual events with ❌
- Continue processing other events if one fails
- Show a summary at the end with success/error counts
- Exit with appropriate exit codes for scripting

## Database impact

This seeder is safe to run multiple times as it only updates events that don't already have branch links (`branchLink IS NULL OR branchLink = ''`). 