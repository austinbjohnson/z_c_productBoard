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

const perform = async (z, bundle) => {
  const { entityType } = bundle.inputData;

  // Build query parameters for GET request
  // Note: The GET /v2/entities endpoint only supports 'type' filtering.
  // Advanced filters (owner, status, health, etc.) require the POST /v2/entities/search 
  // endpoint which may not be available for all accounts.
  const params = {};
  
  if (entityType) {
    params.type = entityType;
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
      'Lists entities in Productboard by type (features, initiatives, objectives, etc.).',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'entityType',
        label: 'Entity Type',
        type: 'string',
        choices: ENTITY_TYPES,
        required: false,
        helpText:
          'Filter by entity type (e.g., feature, initiative, objective). Leave empty to list all entities.',
      },
    ],
    sample,
    outputFields: entityOutputFields,
  },
};
