/**
 * Productboard Zapier Integration
 *
 * Integrates with Productboard API v2.0.0 (Beta)
 *
 * Features:
 * - List entities (features, initiatives, objectives, etc.)
 * - Get a specific entity with health update details
 * - Get entity relationships (parent, child, linked entities)
 * - Create/update health status for entities
 * - Create note relationships (link insights to features)
 *
 * @see https://developer.productboard.com/v2.0.0/reference/introduction
 */

const { version } = require('./package.json');

const authentication = require('./authentication');
const healthUpdates = require('./triggers/healthUpdates');
const listEntities = require('./searches/listEntities');
const getEntity = require('./searches/getEntity');
const getEntityRelationships = require('./searches/getEntityRelationships');
const createHealthUpdate = require('./creates/createHealthUpdate');
const createNoteRelationship = require('./creates/createNoteRelationship');

/**
 * Middleware: Add authentication header to all requests
 */
const addAuthHeader = (request, z, bundle) => {
  if (bundle.authData.apiToken) {
    request.headers = request.headers || {};
    request.headers['Authorization'] = `Bearer ${bundle.authData.apiToken}`;
    // Note: Don't set Content-Type here - Zapier sets it automatically for JSON bodies
    // Setting it manually causes duplicate headers: "application/json, application/json"
    request.headers['Accept'] = 'application/json';
  }
  return request;
};

/**
 * Middleware: Handle API errors with helpful messages
 */
const handleErrors = (response, z, bundle) => {
  if (response.status >= 400) {
    const errorBody = response.data || {};
    
    // Common error scenarios
    if (response.status === 401) {
      throw new z.errors.Error(
        'Authentication failed. Please check your Productboard API token.',
        'AuthenticationError',
        response.status
      );
    }
    
    if (response.status === 403) {
      throw new z.errors.Error(
        'Access denied. Your API token may not have permission for this action.',
        'ForbiddenError',
        response.status
      );
    }
    
    if (response.status === 404) {
      throw new z.errors.Error(
        'Resource not found. The entity ID may be incorrect.',
        'NotFoundError',
        response.status
      );
    }
    
    if (response.status === 429) {
      throw new z.errors.Error(
        'Rate limit exceeded. Productboard allows 50 requests/second. Please retry.',
        'RateLimitError',
        response.status
      );
    }
    
    // Extract error message from various possible formats
    let message = 'Unknown API error';
    if (errorBody.message) {
      message = errorBody.message;
    } else if (errorBody.error) {
      // Handle both string and nested object formats
      message = typeof errorBody.error === 'string' 
        ? errorBody.error 
        : errorBody.error.message || JSON.stringify(errorBody.error);
    } else if (errorBody.errors && Array.isArray(errorBody.errors)) {
      // Handle array of errors format
      message = errorBody.errors.map(e => e.message || e.detail || JSON.stringify(e)).join('; ');
    } else if (errorBody.detail) {
      // Handle RFC 7807 Problem Details format
      message = errorBody.detail;
    } else if (errorBody.title) {
      message = errorBody.title;
    } else if (Object.keys(errorBody).length > 0) {
      // Last resort: stringify the entire error body for debugging
      message = JSON.stringify(errorBody);
    }
    
    throw new z.errors.Error(
      `Productboard API error (${response.status}): ${message}`,
      'ApiError',
      response.status
    );
  }
  
  return response;
};

module.exports = {
  version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  // Request middleware
  beforeRequest: [addAuthHeader],

  // Response middleware
  afterResponse: [handleErrors],

  // Triggers - for polling/webhooks
  triggers: {
    [healthUpdates.key]: healthUpdates,
  },

  // Searches - for finding records
  searches: {
    [listEntities.key]: listEntities,
    [getEntity.key]: getEntity,
    [getEntityRelationships.key]: getEntityRelationships,
  },

  // Creates - for creating/updating records
  creates: {
    [createHealthUpdate.key]: createHealthUpdate,
    [createNoteRelationship.key]: createNoteRelationship,
  },

  // Resources can be used for dynamic dropdowns (future enhancement)
  resources: {},
};

