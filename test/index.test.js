/**
 * Tests for Productboard Zapier Integration
 */

const zapier = require('zapier-platform-core');
const App = require('../index');

const appTester = zapier.createAppTester(App);

// Mock bundle with auth
const getBundle = (inputData = {}) => ({
  authData: {
    apiToken: process.env.PRODUCTBOARD_API_TOKEN || 'test_token_xxx',
  },
  inputData,
});

describe('Authentication', () => {
  it('should have custom auth type', () => {
    expect(App.authentication.type).toBe('custom');
  });

  it('should have apiToken field', () => {
    const fields = App.authentication.fields;
    expect(fields).toHaveLength(1);
    expect(fields[0].key).toBe('apiToken');
    expect(fields[0].required).toBe(true);
  });
});

describe('List Entities Trigger', () => {
  const trigger = App.triggers.listEntities;

  it('should have correct key and noun', () => {
    expect(trigger.key).toBe('listEntities');
    expect(trigger.noun).toBe('Entity');
  });

  it('should have entity type choices', () => {
    const entityTypeField = trigger.operation.inputFields.find(f => f.key === 'entityType');
    expect(entityTypeField.choices).toBeDefined();
    expect(entityTypeField.choices.length).toBeGreaterThan(0);
    
    const types = entityTypeField.choices.map(c => c.value);
    expect(types).toContain('feature');
    expect(types).toContain('initiative');
    expect(types).toContain('objective');
  });

  it('should have sample data', () => {
    expect(trigger.operation.sample).toBeDefined();
    expect(trigger.operation.sample.id).toBeDefined();
    expect(trigger.operation.sample.type).toBe('feature');
  });
});

describe('Get Entity Search', () => {
  const search = App.searches.getEntity;

  it('should have correct key and noun', () => {
    expect(search.key).toBe('getEntity');
    expect(search.noun).toBe('Entity');
  });

  it('should require entityId', () => {
    const entityIdField = search.operation.inputFields.find(f => f.key === 'entityId');
    expect(entityIdField.required).toBe(true);
  });

  it('should have health fields in output', () => {
    const outputKeys = search.operation.outputFields.map(f => f.key);
    expect(outputKeys).toContain('healthStatus');
    expect(outputKeys).toContain('healthMode');
    expect(outputKeys).toContain('healthComment');
  });
});

describe('Create Health Update Action', () => {
  const create = App.creates.createHealthUpdate;

  it('should have correct key and noun', () => {
    expect(create.key).toBe('createHealthUpdate');
    expect(create.noun).toBe('Health Update');
  });

  it('should require entityId and status', () => {
    const fields = create.operation.inputFields;
    const entityIdField = fields.find(f => f.key === 'entityId');
    const statusField = fields.find(f => f.key === 'status');
    
    expect(entityIdField.required).toBe(true);
    expect(statusField.required).toBe(true);
  });

  it('should have correct health status choices', () => {
    const statusField = create.operation.inputFields.find(f => f.key === 'status');
    const statuses = statusField.choices.map(c => c.value);
    
    expect(statuses).toContain('notSet');
    expect(statuses).toContain('onTrack');
    expect(statuses).toContain('atRisk');
    expect(statuses).toContain('offTrack');
  });

  it('should have correct health mode choices', () => {
    const modeField = create.operation.inputFields.find(f => f.key === 'mode');
    const modes = modeField.choices.map(c => c.value);
    
    expect(modes).toContain('manual');
    expect(modes).toContain('calculated');
  });
});

describe('Middleware', () => {
  it('should have beforeRequest middleware', () => {
    expect(App.beforeRequest).toBeDefined();
    expect(App.beforeRequest.length).toBeGreaterThan(0);
  });

  it('should have afterResponse middleware', () => {
    expect(App.afterResponse).toBeDefined();
    expect(App.afterResponse.length).toBeGreaterThan(0);
  });
});

