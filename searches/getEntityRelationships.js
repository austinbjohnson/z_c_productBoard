/**
 * Get Entity Relationships Search
 *
 * Retrieves all relationships for a specific entity from Productboard API v2.0.0
 * Returns parent, child, and linked entity connections.
 *
 * @see https://developer.productboard.com/v2.0.0/reference/getentityrelationships
 */

const perform = async (z, bundle) => {
  const { entityId } = bundle.inputData;

  if (!entityId) {
    return [];
  }

  try {
    const response = await z.request({
      url: `https://api.productboard.com/v2/entities/${entityId}/relationships`,
      method: 'GET',
    });

    const data = response.data.data || response.data;
    const relationships = Array.isArray(data) ? data : [data];

    // Format each relationship for output
    return relationships.map((rel) => ({
      id: rel.id || `${entityId}_${rel.relatedEntity?.id}`,
      sourceEntityId: entityId,
      relationshipType: rel.type || rel.relationshipType || '',
      direction: rel.direction || '',

      // Related entity details
      relatedEntityId: rel.relatedEntity?.id || rel.targetId || '',
      relatedEntityType: rel.relatedEntity?.type || rel.targetType || '',
      relatedEntityName: rel.relatedEntity?.fields?.name || rel.targetName || '',

      // Metadata
      createdAt: rel.createdAt || '',
    }));
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
  id: 'rel_12345',
  sourceEntityId: 'ent_feature123',
  relationshipType: 'parent',
  direction: 'outbound',
  relatedEntityId: 'ent_initiative456',
  relatedEntityType: 'initiative',
  relatedEntityName: 'Q1 Product Launch',
  createdAt: '2025-06-01T00:00:00Z',
};

const outputFields = [
  { key: 'id', label: 'Relationship ID', type: 'string' },
  { key: 'sourceEntityId', label: 'Source Entity ID', type: 'string' },
  { key: 'relationshipType', label: 'Relationship Type', type: 'string' },
  { key: 'direction', label: 'Direction', type: 'string' },
  { key: 'relatedEntityId', label: 'Related Entity ID', type: 'string' },
  { key: 'relatedEntityType', label: 'Related Entity Type', type: 'string' },
  { key: 'relatedEntityName', label: 'Related Entity Name', type: 'string' },
  { key: 'createdAt', label: 'Created At', type: 'datetime' },
];

module.exports = {
  key: 'getEntityRelationships',
  noun: 'Entity Relationship',
  display: {
    label: 'Get Entity Relationships',
    description: 'Retrieves all relationships for an entity, including parent, child, and linked entities.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'entityId',
        label: 'Entity ID',
        type: 'string',
        required: true,
        helpText: 'The unique ID of the entity to retrieve relationships for.',
      },
    ],
    sample,
    outputFields,
  },
};
