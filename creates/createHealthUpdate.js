/**
 * Create Health Update Action
 *
 * Creates/updates a health status for an entity in Productboard API v2.0.0
 *
 * Health fields from Productboard docs:
 * - mode: HealthModeEnum (manual, calculated)
 * - status: HealthStatusEnum (notSet, onTrack, atRisk, offTrack)
 * - comment: RichTextFieldValue (HTML content)
 * - createdBy: MemberFieldAssign (member ID)
 *
 * @see https://developer.productboard.com/v2.0.0/reference/update-entity
 */

const { formatEntity, entityOutputFields } = require('../lib/utils');

const HEALTH_STATUS_OPTIONS = {
  notSet: 'Not Set',
  onTrack: 'On Track',
  atRisk: 'At Risk',
  offTrack: 'Off Track',
};

const HEALTH_MODE_OPTIONS = {
  manual: 'Manual',
  calculated: 'Calculated',
};

const perform = async (z, bundle) => {
  const { entityId, status, comment, mode, createdById } = bundle.inputData;

  // Build the health update payload per Productboard API v2 spec
  const healthUpdate = {
    status: status,
    mode: mode || 'manual',
  };

  // Comment should be HTML (RichTextFieldValue)
  if (comment) {
    // Wrap plain text in paragraph tags if not already HTML
    healthUpdate.comment = comment.startsWith('<') ? comment : `<p>${comment}</p>`;
  }

  // Optional: specify who created the health update
  if (createdById) {
    healthUpdate.createdBy = {
      id: createdById,
    };
  }

  // Update the entity with the new health field value
  // API v2 format: { data: { fields: { health: {...} } } }
  await z.request({
    url: `https://api.productboard.com/v2/entities/${entityId}`,
    method: 'PATCH',
    body: {
      data: {
        fields: {
          health: healthUpdate,
        },
      },
    },
  });

  // PATCH returns minimal data, so fetch the full entity to return complete info
  const getResponse = await z.request({
    url: `https://api.productboard.com/v2/entities/${entityId}`,
    method: 'GET',
  });

  const updatedEntity = getResponse.data.data || getResponse.data;

  // Return the formatted entity with updated health
  return formatEntity(updatedEntity);
};

// Sample data for Zap editor testing
const sample = {
  id: 'ent_feature123',
  type: 'feature',
  name: 'User Authentication',
  description: '<p>Implement secure user authentication flow</p>',
  descriptionPlainText: 'Implement secure user authentication flow',
  url: 'https://zapier.productboard.com/feature-board/165206/detail/feature/ent_feature123',

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
    id: 'health_abc789',
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
  key: 'createHealthUpdate',
  noun: 'Health Update',
  display: {
    label: 'Create/Update Health Status',
    description: 'Updates the health status for a Productboard entity (feature, initiative, objective, etc.).',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'entityId',
        label: 'Entity ID',
        type: 'string',
        required: true,
        helpText: 'The ID of the entity to update (feature, initiative, objective, etc.).',
      },
      {
        key: 'status',
        label: 'Health Status',
        type: 'string',
        choices: HEALTH_STATUS_OPTIONS,
        required: true,
        helpText: 'The new health status for the entity.',
      },
      {
        key: 'comment',
        label: 'Comment',
        type: 'text',
        required: false,
        helpText: 'Optional comment explaining the health status. Can be plain text or HTML.',
      },
      {
        key: 'mode',
        label: 'Mode',
        type: 'string',
        choices: HEALTH_MODE_OPTIONS,
        required: false,
        default: 'manual',
        helpText: 'Health mode - typically "manual" when set via API.',
      },
      {
        key: 'createdById',
        label: 'Created By (Member ID)',
        type: 'string',
        required: false,
        helpText: 'Optional: The UUID of the Productboard member creating this update.',
      },
    ],
    sample,
    outputFields: entityOutputFields,
  },
};
