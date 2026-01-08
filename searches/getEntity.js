/**
 * Get Entity Search
 *
 * Retrieves a specific entity by ID from Productboard API v2.0.0
 *
 * @see https://developer.productboard.com/v2.0.0/reference/retrieve-entity
 */

const { formatEntity, entityOutputFields } = require('../lib/utils');

const perform = async (z, bundle) => {
  const { entityId } = bundle.inputData;

  if (!entityId) {
    return [];
  }

  try {
    const response = await z.request({
      url: `https://api.productboard.com/v2/entities/${entityId}`,
      method: 'GET',
    });

    const entity = response.data.data || response.data;
    return [formatEntity(entity)];
  } catch (error) {
    // Entity not found - return empty array (standard for searches)
    if (error.status === 404) {
      return [];
    }
    throw error;
  }
};

// Sample data for Zap editor testing
const sample = {
  id: 'ent_feature123',
  type: 'feature',
  name: 'Dark Mode Support',
  description: '<p>Implement dark mode theme across the application</p>',
  descriptionPlainText: 'Implement dark mode theme across the application',
  url: 'https://zapier.productboard.com/feature-board/165206/detail/feature/ent_feature123',

  status: 'Planned',
  statusId: 'status_456',
  archived: false,

  ownerEmail: 'pm@example.com',
  ownerId: 'member_456',

  startDate: '2025-02-01',
  endDate: '2025-04-30',

  createdAt: '2025-06-01T00:00:00Z',
  updatedAt: '2025-12-13T15:30:00Z',

  health: {
    id: 'health_update_456',
    status: 'onTrack',
    previousStatus: 'atRisk',
    mode: 'manual',
    comment: '<p>Health is looking good!</p>',
    commentPlainText: 'Health is looking good!',
    lastUpdatedAt: '2025-12-13T12:00:00Z',
    updatedByEmail: 'pm@example.com',
    updatedById: 'member_789',
  },
};

module.exports = {
  key: 'getEntity',
  noun: 'Entity',
  display: {
    label: 'Get Entity',
    description: 'Finds a specific entity by ID, including its health status.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'entityId',
        label: 'Entity ID',
        type: 'string',
        required: true,
        helpText: 'The unique ID of the entity to retrieve (e.g., from a previous Productboard step).',
      },
    ],
    sample,
    outputFields: entityOutputFields,
  },
};
