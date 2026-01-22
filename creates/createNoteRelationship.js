/**
 * Create Note Relationship Action
 *
 * Creates a link between a ProductBoard note (insight) and a feature, product, or component.
 *
 * API Endpoint: POST https://api.productboard.com/v2/notes/{noteId}/relationships
 * API Version: v2.0.0 (required - v1 doesn't support relationship creation)
 *
 * Note: API returns the note object on success, not the relationship details.
 * If a customer relationship already exists, it will be replaced.
 * Notes can have one customer relationship and multiple product link relationships.
 *
 * @see https://developer.productboard.com/v2.0.0/reference/setnoterelationship
 */

const perform = async (z, bundle) => {
  const { noteId, targetEntityId } = bundle.inputData;

  // Create the relationship via POST to notes/{noteId}/relationships
  // Request body format per v2 API docs:
  // { data: { type: "link", target: { id: "<uuid>", type: "link" } } }
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

  // API returns the note object on success (201), not relationship details
  const note = response.data.data || response.data;

  // Return confirmation with the input IDs and note info
  return {
    success: true,
    noteId: noteId,
    targetEntityId: targetEntityId,
    noteType: note.type || 'simple',
    noteSelfLink: note.links?.self || `https://api.productboard.com/v2/notes/${noteId}`,
  };
};

// Sample data for Zap editor testing
const sample = {
  success: true,
  noteId: '62099d4c-571f-405d-abc0-9e3925d053ee',
  targetEntityId: '7e8581c9-900d-40f5-bf91-5d5cb790a53d',
  noteType: 'simple',
  noteSelfLink: 'https://api.productboard.com/v2/notes/62099d4c-571f-405d-abc0-9e3925d053ee',
};

// Output field definitions
const outputFields = [
  { key: 'success', label: 'Success', type: 'boolean' },
  { key: 'noteId', label: 'Note ID', type: 'string' },
  { key: 'targetEntityId', label: 'Target Entity ID', type: 'string' },
  { key: 'noteType', label: 'Note Type', type: 'string' },
  { key: 'noteSelfLink', label: 'Note API Link', type: 'string' },
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
