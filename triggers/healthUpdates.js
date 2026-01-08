/**
 * Health Updates Trigger
 *
 * Triggers when a health status is updated on a Productboard entity.
 * Returns entities with health updates, sorted by most recent.
 *
 * @see https://developer.productboard.com/v2.0.0/reference/list-entities
 */

const { formatEntity, entityOutputFields } = require('../lib/utils');

const ENTITY_TYPES = {
  feature: 'Feature',
  initiative: 'Initiative',
  objective: 'Objective',
  keyResult: 'Key Result',
};

const perform = async (z, bundle) => {
  const { entityType } = bundle.inputData;

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

  // Filter to only entities with health updates and format
  const entitiesWithHealth = entities
    .filter((entity) => entity.fields?.health?.id)
    .map((entity) => {
      const formatted = formatEntity(entity);
      // Use health ID as the unique identifier for trigger deduplication
      return {
        ...formatted,
        id: formatted.health.id,
        entityId: entity.id,
      };
    })
    // Sort by health update time (newest first)
    .sort((a, b) => new Date(b.health.lastUpdatedAt) - new Date(a.health.lastUpdatedAt));

  return entitiesWithHealth;
};

// Sample data for Zap editor testing
const sample = {
  id: 'health_abc123',
  entityId: 'ent_feature456',
  type: 'feature',
  name: 'User Authentication',
  description: '<p>Implement secure user authentication flow</p>',
  descriptionPlainText: 'Implement secure user authentication flow',
  url: 'https://zapier.productboard.com/feature-board/165206/detail/feature/ent_feature456',

  status: 'In Progress',
  statusId: 'status_123',
  archived: false,

  ownerEmail: 'pm@example.com',
  ownerId: 'member_456',

  startDate: '2025-01-01',
  endDate: '2025-03-31',

  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-12-13T12:00:00Z',

  health: {
    id: 'health_abc123',
    status: 'onTrack',
    previousStatus: 'atRisk',
    mode: 'manual',
    comment: '<p>Development is back on schedule.</p>',
    commentPlainText: 'Development is back on schedule.',
    lastUpdatedAt: '2025-12-13T12:00:00Z',
    updatedByEmail: 'pm@example.com',
    updatedById: 'member_789',
  },
};

module.exports = {
  key: 'healthUpdates',
  noun: 'Health Update',
  display: {
    label: 'New Health Update',
    description: 'Triggers when a health status is updated on a Productboard entity (feature, initiative, objective, or key result).',
  },
  operation: {
    type: 'polling',
    perform,
    inputFields: [
      {
        key: 'entityType',
        label: 'Entity Type',
        type: 'string',
        choices: ENTITY_TYPES,
        required: false,
        helpText: 'Filter by entity type. Leave empty to get health updates from all entity types.',
      },
    ],
    sample,
    outputFields: [
      { key: 'entityId', label: 'Entity ID', type: 'string' },
      ...entityOutputFields,
    ],
  },
};
