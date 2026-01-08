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
    // API returns: { type: "link"|"parent"|"child", target: { id, type, links } }
    return relationships.map((rel) => ({
      id: `${entityId}_${rel.target?.id || 'unknown'}`,
      sourceEntityId: entityId,
      relationshipType: rel.type || '',

      // Related entity details from target object
      relatedEntityId: rel.target?.id || '',
      relatedEntityType: rel.target?.type || '',
      relatedEntityUrl: rel.target?.links?.self || '',
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
  id: '766ec003-95ef-45fc-9b2d-94532b247df2_017a2f72-d597-4e36-98b9-cee533018dd0',
  sourceEntityId: '766ec003-95ef-45fc-9b2d-94532b247df2',
  relationshipType: 'link',
  relatedEntityId: '017a2f72-d597-4e36-98b9-cee533018dd0',
  relatedEntityType: 'feature',
  relatedEntityUrl: 'https://api.productboard.com/v2/entities/017a2f72-d597-4e36-98b9-cee533018dd0',
};

const outputFields = [
  { key: 'id', label: 'Relationship ID', type: 'string' },
  { key: 'sourceEntityId', label: 'Source Entity ID', type: 'string' },
  { key: 'relationshipType', label: 'Relationship Type', type: 'string' },
  { key: 'relatedEntityId', label: 'Related Entity ID', type: 'string' },
  { key: 'relatedEntityType', label: 'Related Entity Type', type: 'string' },
  { key: 'relatedEntityUrl', label: 'Related Entity API URL', type: 'string' },
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
