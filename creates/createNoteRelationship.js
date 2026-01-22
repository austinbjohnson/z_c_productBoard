/**
 * Create Note Relationship Action
 *
 * Creates a link between a ProductBoard note (insight) and a feature, product, or component.
 *
 * API Endpoint: POST https://api.productboard.com/v2/notes/{noteId}/relationships
 * API Version: v2.0.0 (required - v1 doesn't support relationship creation)
 *
 * @see https://developer.productboard.com/v2.0.0/reference/introduction
 * @see https://developer.productboard.com/docs/notes-api-for-insights
 */

const perform = async (z, bundle) => {
  const { noteId, targetEntityId } = bundle.inputData;

  // Create the relationship via POST to notes/{noteId}/relationships
  const response = await z.request({
    url: `https://api.productboard.com/v2/notes/${noteId}/relationships`,
    method: 'POST',
    body: {
      data: {
        type: 'link',
        target: {
          id: targetEntityId,
          type: 'link',
        },
      },
    },
  });

  const relationship = response.data.data || response.data;

  // Format the response for Zapier output
  return {
    relationshipId: relationship.id,
    noteId: noteId,
    targetEntityId: relationship.target?.id || targetEntityId,
    targetEntityUrl: relationship.target?.url || '',
    type: relationship.type || 'link',
  };
};

// Sample data for Zap editor testing
const sample = {
  relationshipId: 'rel_abc123-relationship-uuid',
  noteId: '62099d4c-571f-405d-abc0-9e3925d053ee',
  targetEntityId: '7e8581c9-900d-40f5-bf91-5d5cb790a53d',
  targetEntityUrl: 'https://zapier.productboard.com/feature-board/165206/detail/feature/7e8581c9-900d-40f5-bf91-5d5cb790a53d',
  type: 'link',
};

// Output field definitions
const outputFields = [
  { key: 'relationshipId', label: 'Relationship ID', type: 'string' },
  { key: 'noteId', label: 'Note ID', type: 'string' },
  { key: 'targetEntityId', label: 'Target Entity ID', type: 'string' },
  { key: 'targetEntityUrl', label: 'Target Entity URL', type: 'string' },
  { key: 'type', label: 'Relationship Type', type: 'string' },
];

module.exports = {
  key: 'createNoteRelationship',
  noun: 'Note Relationship',
  display: {
    label: 'Create Note Relationship',
    description: 'Creates a link between a ProductBoard note (insight) and a feature, product, or component.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'noteId',
        label: 'Note ID',
        type: 'string',
        required: true,
        helpText: 'The UUID of the note to link (not the base64-encoded URL ID).',
      },
      {
        key: 'targetEntityId',
        label: 'Target Entity ID',
        type: 'string',
        required: true,
        helpText: 'The UUID of the feature, product, or component to link to.',
      },
    ],
    sample,
    outputFields,
  },
};
