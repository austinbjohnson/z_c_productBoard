/**
 * Search Entities
 *
 * Lists and filters entities from Productboard API v2.0.0 using the GET endpoint.
 * Supports filtering by type, owner, status, health, and relationships.
 *
 * @see https://developer.productboard.com/v2.0.0/reference/list-entities
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
  const { entityType } = bundle.inputData;

  // Build query parameters for GET request
  const params = {};
  
  if (entityType) {
    params.type = entityType;
  }

  // Add filter parameters from input data
  const { ownerIds, statusNames, healthStatus, archived, parentId, 
          componentId, productId, initiativeId, objectiveId, releaseId } = bundle.inputData;

  if (ownerIds) {
    const ids = Array.isArray(ownerIds) ? ownerIds : ownerIds.split(',').map(id => id.trim());
    params['owner.id'] = ids.join(',');
  }
  if (statusNames) {
    const names = Array.isArray(statusNames) ? statusNames : statusNames.split(',').map(s => s.trim());
    params['status.name'] = names.join(',');
  }
  if (healthStatus) {
    params['health.status'] = healthStatus;
  }
  if (archived && archived !== 'all') {
    params.archived = archived === 'true';
  }
  if (parentId) {
    params['parent.id'] = parentId;
  }
  if (componentId) {
    params['component.id'] = componentId;
  }
  if (productId) {
    params['product.id'] = productId;
  }
  if (initiativeId) {
    params['initiative.id'] = initiativeId;
  }
  if (objectiveId) {
    params['objective.id'] = objectiveId;
  }
  if (releaseId) {
    params['release.id'] = releaseId;
  }

  const response = await z.request({
    url: 'https://api.productboard.com/v2/entities',
    method: 'GET',
    params,
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
