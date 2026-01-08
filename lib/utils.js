/**
 * Shared utilities for Productboard integration
 */

/**
 * Strip HTML tags and decode entities to plain text
 */
const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Build Productboard URL for an entity
 * Format: https://zapier.productboard.com/feature-board/165206/detail/{type}/{id}
 */
const getEntityUrl = (entityType, entityId) => {
  return `https://zapier.productboard.com/feature-board/165206/detail/${entityType}/${entityId}`;
};

/**
 * Format an entity from the API response into a clean payload
 * Entity is the primary object with health as a nested field
 */
const formatEntity = (entity) => {
  const fields = entity.fields || {};
  const health = fields.health || null;

  return {
    // Entity core fields
    id: entity.id,
    type: entity.type,
    name: fields.name || '',
    description: fields.description || '',
    descriptionPlainText: stripHtml(fields.description),
    url: getEntityUrl(entity.type, entity.id),

    // Status
    status: fields.status?.name || '',
    statusId: fields.status?.id || '',
    archived: fields.archived || false,

    // Owner
    ownerEmail: fields.owner?.email || '',
    ownerId: fields.owner?.id || '',

    // Timeframe
    startDate: fields.timeframe?.startDate || '',
    endDate: fields.timeframe?.endDate || '',

    // Timestamps
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,

    // Health (nested object, only if present)
    health: health ? {
      id: health.id,
      status: health.status,
      previousStatus: health.previousStatus || '',
      mode: health.mode,
      comment: health.comment || '',
      commentPlainText: stripHtml(health.comment),
      lastUpdatedAt: health.lastUpdatedAt,
      updatedByEmail: health.createdBy?.email || '',
      updatedById: health.createdBy?.id || '',
    } : null,
  };
};

/**
 * Common output fields for entity payloads
 * Uses dot notation for nested health fields
 */
const entityOutputFields = [
  { key: 'id', label: 'Entity ID', type: 'string' },
  { key: 'type', label: 'Entity Type', type: 'string' },
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'description', label: 'Description (HTML)', type: 'string' },
  { key: 'descriptionPlainText', label: 'Description', type: 'string' },
  { key: 'url', label: 'Productboard URL', type: 'string' },

  { key: 'status', label: 'Status', type: 'string' },
  { key: 'statusId', label: 'Status ID', type: 'string' },
  { key: 'archived', label: 'Archived', type: 'boolean' },

  { key: 'ownerEmail', label: 'Owner Email', type: 'string' },
  { key: 'ownerId', label: 'Owner ID', type: 'string' },

  { key: 'startDate', label: 'Start Date', type: 'string' },
  { key: 'endDate', label: 'End Date', type: 'string' },

  { key: 'createdAt', label: 'Created At', type: 'datetime' },
  { key: 'updatedAt', label: 'Updated At', type: 'datetime' },

  // Health fields (nested)
  { key: 'health__id', label: 'Health ID', type: 'string' },
  { key: 'health__status', label: 'Health Status', type: 'string' },
  { key: 'health__previousStatus', label: 'Health Previous Status', type: 'string' },
  { key: 'health__mode', label: 'Health Mode', type: 'string' },
  { key: 'health__comment', label: 'Health Comment (HTML)', type: 'string' },
  { key: 'health__commentPlainText', label: 'Health Comment', type: 'string' },
  { key: 'health__lastUpdatedAt', label: 'Health Last Updated', type: 'datetime' },
  { key: 'health__updatedByEmail', label: 'Health Updated By (Email)', type: 'string' },
  { key: 'health__updatedById', label: 'Health Updated By (ID)', type: 'string' },
];

module.exports = {
  stripHtml,
  getEntityUrl,
  formatEntity,
  entityOutputFields,
};
