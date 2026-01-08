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

/**
 * Middleware: Add authentication header to all requests
 */
const addAuthHeader = (request, z, bundle) => {
  if (bundle.authData.apiToken) {
    request.headers = request.headers || {};
    request.headers['Authorization'] = `Bearer ${bundle.authData.apiToken}`;
    request.headers['Content-Type'] = 'application/json';
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
    
    // Generic error with API message
    const message = errorBody.message || errorBody.error || 'Unknown API error';
    throw new z.errors.Error(
      `Productboard API error: ${message}`,
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
  },

  // Resources can be used for dynamic dropdowns (future enhancement)
  resources: {},
};

