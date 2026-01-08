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

/**
 * Build filter object from input data
 * Only includes filters that have values
 */
const buildFilter = (inputData) => {
  const filter = {};

  // Owner filter - supports multiple owner IDs
  if (inputData.ownerIds && inputData.ownerIds.length > 0) {
    const ids = Array.isArray(inputData.ownerIds)
      ? inputData.ownerIds
      : inputData.ownerIds.split(',').map((id) => id.trim());
    if (ids.length > 0) {
      filter['owner.id'] = ids;
    }
  }

  // Status name filter - supports multiple statuses
  if (inputData.statusNames && inputData.statusNames.length > 0) {
    const names = Array.isArray(inputData.statusNames)
      ? inputData.statusNames
      : inputData.statusNames.split(',').map((s) => s.trim());
    if (names.length > 0) {
      filter['status.name'] = names;
    }
  }

  // Health status filter
  if (inputData.healthStatus) {
    filter['health.status'] = [inputData.healthStatus];
  }

  // Archived filter
  if (inputData.archived && inputData.archived !== 'all') {
    filter['archived'] = [inputData.archived === 'true'];
  }

  // Parent entity filter - for hierarchy traversal
  if (inputData.parentId) {
    filter['parent.id'] = [inputData.parentId];
  }

  // Component filter - filter features by component
  if (inputData.componentId) {
    filter['component.id'] = [inputData.componentId];
  }

  // Product filter
  if (inputData.productId) {
    filter['product.id'] = [inputData.productId];
  }

  // Initiative filter - filter features linked to initiative
  if (inputData.initiativeId) {
    filter['initiative.id'] = [inputData.initiativeId];
  }

  // Objective filter
  if (inputData.objectiveId) {
    filter['objective.id'] = [inputData.objectiveId];
  }

  // Release filter
  if (inputData.releaseId) {
    filter['release.id'] = [inputData.releaseId];
  }

  // Timeframe filters
  if (inputData.startDateFrom) {
    filter['timeframe.startDate.gte'] = [inputData.startDateFrom];
  }
  if (inputData.startDateTo) {
    filter['timeframe.startDate.lte'] = [inputData.startDateTo];
  }
  if (inputData.endDateFrom) {
    filter['timeframe.endDate.gte'] = [inputData.endDateFrom];
  }
  if (inputData.endDateTo) {
    filter['timeframe.endDate.lte'] = [inputData.endDateTo];
  }

  return filter;
};

const perform = async (z, bundle) => {
  const { entityType } = bundle.inputData;

  // If no entity type specified, fall back to GET endpoint for listing all
  if (!entityType) {
    const response = await z.request({
      url: 'https://api.productboard.com/v2/entities',
      method: 'GET',
    });
    const entities = response.data.data || [];
    return entities.map(formatEntity);
  }

  // Use POST search endpoint for filtered searches
  const filter = buildFilter(bundle.inputData);

  const requestBody = {
    type: entityType,
  };

  // Only include filter if we have filter conditions
  if (Object.keys(filter).length > 0) {
    requestBody.filter = filter;
  }

  const response = await z.request({
    url: 'https://api.productboard.com/v2/entities/search',
    method: 'POST',
    body: requestBody,
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
          'Filter by entity type. Required for advanced filtering. Leave empty to list all entities without filters.',
      },

      // Ownership & Status
      {
        key: 'ownerIds',
        label: 'Owner IDs',
        type: 'string',
        required: false,
        helpText:
          'Filter by owner(s). Enter comma-separated member IDs (e.g., "member_123,member_456").',
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
        key: 'startDateFrom',
        label: 'Start Date (From)',
        type: 'datetime',
        required: false,
        helpText: 'Filter entities with start date on or after this date.',
      },
      {
        key: 'startDateTo',
        label: 'Start Date (To)',
        type: 'datetime',
        required: false,
        helpText: 'Filter entities with start date on or before this date.',
      },
      {
        key: 'endDateFrom',
        label: 'End Date (From)',
        type: 'datetime',
        required: false,
        helpText: 'Filter entities with end date on or after this date.',
      },
      {
        key: 'endDateTo',
        label: 'End Date (To)',
        type: 'datetime',
        required: false,
        helpText: 'Filter entities with end date on or before this date.',
      },
    ],
    sample,
    outputFields: entityOutputFields,
  },
};
