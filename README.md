# Productboard Zapier Integration

Zapier integration for **Productboard API v2.0.0** (Beta). Manage entities and health updates programmatically.

## Features

| Type | Action | Description |
|------|--------|-------------|
| 🔄 Trigger | **List Entities** | Poll for entities (features, initiatives, objectives, etc.) |
| 🔍 Search | **Get Entity** | Retrieve a specific entity by ID with full health details |
| 🔍 Search | **Get Entity Relationships** | Retrieve parent, child, and linked entities for an entity |
| ✏️ Action | **Create/Update Health** | Update health status (onTrack, atRisk, offTrack) for any entity |

## Health Status Values

Per Productboard API v2 docs:

| Status | Description |
|--------|-------------|
| `notSet` | No health status set |
| `onTrack` | ✅ Everything on schedule |
| `atRisk` | ⚠️ Potential issues |
| `offTrack` | 🔴 Behind schedule/blocked |

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
# Register the integration (first time only)
zapier register

# Set your Productboard API token for testing
zapier env:set 1.0.0 PRODUCTBOARD_API_TOKEN=pb_xxx...
```

### 3. Validate and test

```bash
zapier validate
zapier test
zapier invoke  # Interactive testing
```

### 4. Deploy

```bash
zapier push
```

## Authentication

Uses **API Token** authentication. Users generate tokens from:

> Productboard → Settings → Integrations → Public API

## Entity Types Supported

- `product` - Products
- `component` - Components  
- `feature` - Features
- `subfeature` - Subfeatures
- `initiative` - Initiatives
- `objective` - Objectives
- `keyResult` - Key Results
- `release` - Releases
- `releaseGroup` - Release Groups

## Example Zap Ideas

1. **Slack → Productboard**: When a message contains "blocked", update feature health to "offTrack"
2. **Jira → Productboard**: Sync sprint status to initiative health
3. **Productboard → Email**: Notify stakeholders when health changes to "atRisk"
4. **Schedule → Productboard**: Daily health report of all initiatives

## API Reference

- [Productboard API v2 Docs](https://developer.productboard.com/v2.0.0/reference/introduction)
- [Entity Fields](https://developer.productboard.com/v2.0.0/reference/field-value-types)
- [Health Fields](#health-fields)

### Health Fields (from docs)

```json
{
  "id": "UUID",
  "mode": "manual",
  "status": "onTrack",
  "previousStatus": "atRisk", 
  "lastUpdatedAt": "2023-10-01T12:00:00Z",
  "comment": "<p>Health is looking good!</p>",
  "createdBy": {
    "email": "user@example.com"
  }
}
```

## Rate Limits

Productboard API v2 allows **50 requests per second** per token.

## File Structure

```
├── index.js              # Main entry point
├── authentication.js     # API token auth
├── package.json
├── triggers/
│   └── healthUpdates.js  # Health updates trigger
├── searches/
│   ├── listEntities.js   # List entities search
│   ├── getEntity.js      # Get entity search
│   └── getEntityRelationships.js  # Get entity relationships
└── creates/
    └── createHealthUpdate.js  # Health update action
```

## CLI Commands Reference

```bash
# Development
zapier validate          # Check for errors
zapier test              # Run tests
zapier invoke            # Interactive testing

# Deployment  
zapier push              # Deploy new version
zapier promote 1.0.0     # Promote to production

# Debugging
zapier logs --type http --detailed --limit=10

# Sharing
# Via UI: Manage → Sharing → copy link or invite by email
```

## Notes

⚠️ Productboard API v2 is in **Beta** - endpoints may change. See [Known Issues](https://developer.productboard.com/v2.0.0/reference/known-issues).

