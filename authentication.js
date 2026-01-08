/**
 * Productboard API v2.0.0 Authentication
 * 
 * Uses API Token (Personal Access Token) authentication.
 * Users generate tokens from: Productboard → Settings → Integrations → Public API
 * 
 * @see https://developer.productboard.com/v2.0.0/reference/introduction
 */

const testAuth = async (z, bundle) => {
  // Test auth by fetching entity configurations
  const response = await z.request({
    url: 'https://api.productboard.com/v2/entities/configurations',
    method: 'GET',
  });

  // If we get here, auth succeeded
  // Return some identifier for the connected account
  return {
    id: 'productboard_connection',
    name: 'Productboard API v2',
  };
};

module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'apiToken',
      label: 'API Token',
      type: 'password',
      required: true,
      helpText: 'Your Productboard API token. Generate one from Productboard → Settings → Integrations → Public API.',
    },
  ],
  test: testAuth,
  connectionLabel: 'Productboard (API v2)',
};

