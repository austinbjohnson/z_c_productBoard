/**
 * Search Entities
 *
 * Searches entities from Productboard API v2.0.0 using the POST search endpoint.
 * Supports comprehensive filtering by type, owner, status, health, dates, and more.
 *
 * @see https://developer.productboard.com/v2.0.0/reference/searchentities
 */

const { formatEntity, entityOutputFields } = require('../lib/utils');

const ENTITY_TYPES = {
  product: 'Product',
  component: 'Component',
  feature: 'Feature',
  subfeature: 'Subfeature',
  initiative: 'Initiative',
  objective: 'Objective',
  keyResult: 'Key Result',
  release: 'Release',
  releaseGroup: 'Release Group',
};

const HEALTH_STATUSES = {
  notSet: 'Not Set',
  onTrack: 'On Track',
  atRisk: 'At Risk',
  offTrack: 'Off Track',
};

const ARCHIVED_OPTIONS = {
  false: 'Active only',
  true: 'Archived only',
  all: 'All (active and archived)',
};

const perform = async (z, bundle) => {
  const { entityType, ownerEmails, statusNames, healthStatus, archived, 
          parentId, componentId, productId, initiativeId, objectiveId, releaseId,
          startDate, endDate } = bundle.inputData;

  // Build the search request body per Productboard API v2 spec
  // Structure: { data: { owners: [{email}], statuses: [{name}], ... } }
  const searchData = {
    fields: 'default',
  };

  // Entity type filter - use 'type' (singular) as the field name
  if (entityType) {
    searchData.type = entityType;
  }

  // Owner filter - array of objects with email
  if (ownerEmails) {
    const emails = Array.isArray(ownerEmails) ? ownerEmails : ownerEmails.split(',').map(e => e.trim());
    searchData.owners = emails.map(email => ({ email }));
  }

  // Status filter - array of objects with name
  if (statusNames) {
    const names = Array.isArray(statusNames) ? statusNames : statusNames.split(',').map(s => s.trim());
    searchData.statuses = names.map(name => ({ name }));
  }

  // Health status filter
  if (healthStatus) {
    searchData.health = { status: healthStatus };
  }

  // Archived filter
  if (archived && archived !== 'all') {
    searchData.archived = archived === 'true';
  }

  // Parent filter
  if (parentId) {
    searchData.parent = { id: parentId };
  }

  // Component filter
  if (componentId) {
    searchData.component = { id: componentId };
  }

  // Product filter
  if (productId) {
    searchData.product = { id: productId };
  }

  // Initiative filter
  if (initiativeId) {
    searchData.initiative = { id: initiativeId };
  }

  // Objective filter
  if (objectiveId) {
    searchData.objective = { id: objectiveId };
  }

  // Release filter
  if (releaseId) {
    searchData.release = { id: releaseId };
  }

  // Timeframe filter
  if (startDate || endDate) {
    searchData.timeframe = {};
    if (startDate) searchData.timeframe.startDate = startDate;
    if (endDate) searchData.timeframe.endDate = endDate;
  }

  const response = await z.request({
    url: 'https://api.productboard.com/v2/entities/search',
    method: 'POST',
    body: { data: searchData },
  });

  const entities = response.data.data || [];
  return entities.map(formatEntity);
};

// Sample data for Zap editor testing
const sample = {
  id: 'ent_abc123',
  type: 'feature',
  name: 'User Authentication',
  description: '<p>Implement secure user authentication flow</p>',
  descriptionPlainText: 'Implement secure user authentication flow',
  url: 'https://zapier.productboard.com/feature-board/165206/detail/feature/ent_abc123',

  status: 'In Progress',
  statusId: 'status_123',
  archived: false,

  ownerEmail: 'pm@example.com',
  ownerId: 'member_456',

  startDate: '2025-01-01',
  endDate: '2025-03-31',

  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-12-13T10:00:00Z',

  health: {
    id: 'health_xyz789',
    status: 'onTrack',
    previousStatus: 'atRisk',
    mode: 'manual',
    comment: '<p>On track for Q1 delivery.</p>',
    commentPlainText: 'On track for Q1 delivery.',
    lastUpdatedAt: '2025-12-13T12:00:00Z',
    updatedByEmail: 'pm@example.com',
    updatedById: 'member_789',
  },
};

module.exports = {
  key: 'listEntities',
  noun: 'Entity',
  display: {
    label: 'Find Entities',
    description:
      'Searches entities in Productboard with advanced filtering (features, initiatives, objectives, etc.).',
  },
  operation: {
    perform,
    inputFields: [
      // Primary filter
      {
        key: 'entityType',
        label: 'Entity Type',
        type: 'string',
        choices: ENTITY_TYPES,
        required: false,
        helpText:
          'Filter by entity type. Required for advanced filtering. Leave empty to list all entities.',
      },

      // Ownership & Status
      {
        key: 'ownerEmails',
        label: 'Owner Emails',
        type: 'string',
        required: false,
        helpText:
          'Filter by owner email(s). Enter comma-separated emails (e.g., "austin.johnson@zapier.com").',
      },
      {
        key: 'statusNames',
        label: 'Status Names',
        type: 'string',
        required: false,
        helpText:
          'Filter by status name(s). Enter comma-separated status names exactly as they appear in Productboard (e.g., "In Progress,Done").',
      },
      {
        key: 'healthStatus',
        label: 'Health Status',
        type: 'string',
        choices: HEALTH_STATUSES,
        required: false,
        helpText: 'Filter by health status.',
      },
      {
        key: 'archived',
        label: 'Archived',
        type: 'string',
        choices: ARCHIVED_OPTIONS,
        required: false,
        default: 'false',
        helpText: 'Filter by archived status. Defaults to active entities only.',
      },

      // Hierarchy & Relationships
      {
        key: 'parentId',
        label: 'Parent Entity ID',
        type: 'string',
        required: false,
        helpText: 'Filter by parent entity ID. Useful for finding child entities.',
      },
      {
        key: 'productId',
        label: 'Product ID',
        type: 'string',
        required: false,
        helpText: 'Filter entities belonging to a specific product.',
      },
      {
        key: 'componentId',
        label: 'Component ID',
        type: 'string',
        required: false,
        helpText: 'Filter features by component.',
      },
      {
        key: 'initiativeId',
        label: 'Initiative ID',
        type: 'string',
        required: false,
        helpText: 'Filter entities linked to a specific initiative.',
      },
      {
        key: 'objectiveId',
        label: 'Objective ID',
        type: 'string',
        required: false,
        helpText: 'Filter entities linked to a specific objective.',
      },
      {
        key: 'releaseId',
        label: 'Release ID',
        type: 'string',
        required: false,
        helpText: 'Filter entities assigned to a specific release.',
      },

      // Date filters
      {
        key: 'startDate',
        label: 'Start Date',
        type: 'datetime',
        required: false,
        helpText: 'Filter entities by timeframe start date (YYYY-MM-DD).',
      },
      {
        key: 'endDate',
        label: 'End Date',
        type: 'datetime',
        required: false,
        helpText: 'Filter entities by timeframe end date (YYYY-MM-DD).',
      },
    ],
    sample,
    outputFields: entityOutputFields,
  },
};
