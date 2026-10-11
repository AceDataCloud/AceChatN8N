const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const sdk = require('@n8n/ai-node-sdk');
const { LmChatAceDataCloud } = require('../dist/nodes/LmChatAceDataCloud/LmChatAceDataCloud.node.js');
const { AceDataChatApi } = require('../dist/credentials/AceDataChatApi.credentials.js');

const node = new LmChatAceDataCloud();
function context(token = 'test-token', model = 'gpt-4.1-mini') {
  return {
    getCredentials: async () => ({ apiToken: token }),
    getNodeParameter: () => model,
    getNode: () => ({ name: 'Ace Data Cloud Chat Model', type: 'lmChatAceDataCloud', typeVersion: 1 }),
    helpers: { getSecureEgressFilter: () => 'disabled' },
    logger: { debug() {}, info() {}, warn() {}, error() {} },
  };
}

test('model node exposes only the AI language-model connection and a required model', () => {
  assert.deepEqual(node.description.inputs, []);
  assert.deepEqual(node.description.outputs, ['ai_languageModel']);
  assert.equal(node.description.properties.length, 1);
  assert.equal(node.description.properties[0].name, 'model');
  assert.equal(node.description.properties[0].required, true);
  for (const icon of ['icon.png', 'icon.dark.png'])
    assert.ok(fs.existsSync(path.join(__dirname, '../dist/nodes/LmChatAceDataCloud', icon)));
});

test('credential is masked and its read-only test uses model metadata', () => {
  const credential = new AceDataChatApi();
  assert.equal(credential.properties[0].typeOptions.password, true);
  assert.match(credential.authenticate.properties.headers.Authorization, /Bearer/);
  assert.equal(credential.test.request.method, 'GET');
  assert.equal(credential.test.request.url, '/v1/models');
});

test('model supply uses only the fixed chat base URL and disables billable retries', async () => {
  const original = Object.getOwnPropertyDescriptor(sdk, 'supplyModel');
  let captured;
  Object.defineProperty(sdk, 'supplyModel', {
    configurable: true,
    value: (_context, config) => { captured = config; return { response: {} }; },
  });
  try {
    await node.supplyData.call(context(' test-token ', ' gpt-4.1-mini '), 0);
  } finally {
    Object.defineProperty(sdk, 'supplyModel', original);
  }
  assert.deepEqual(captured, {
    type: 'openai',
    baseUrl: 'https://api.acedata.cloud/v1',
    apiKey: 'test-token',
    model: 'gpt-4.1-mini',
    useResponsesApi: false,
    maxRetries: 0,
    timeout: 300000,
  });
});

test('invalid credential or model stops before constructing a model', async () => {
  await assert.rejects(node.supplyData.call(context(''), 0), /credential is required/i);
  await assert.rejects(node.supplyData.call(context('test-token', ''), 0), /model ID/i);
  await assert.rejects(node.supplyData.call(context('test-token', 'x'.repeat(129)), 0), /model ID/i);
});

test('the host AI SDK builds a model without making an API call', async () => {
  const { response } = await node.supplyData.call(context(), 0);
  assert.equal(response.constructor.name, 'ChatOpenAI');
  assert.equal(response.invocationParams().model, 'gpt-4.1-mini');
  assert.equal(response.clientConfig.baseURL, 'https://api.acedata.cloud/v1');
  assert.equal(response.timeout, 300000);
});
