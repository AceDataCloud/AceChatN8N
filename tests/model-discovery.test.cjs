const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  LmChatAceDataCloud,
} = require("../dist/nodes/LmChatAceDataCloud/LmChatAceDataCloud.node.js");
const node = new LmChatAceDataCloud();

test("native model picker requests only authenticated metadata and filters non-chat IDs", async () => {
  let captured;
  const ctx = {
    helpers: {
      httpRequestWithAuthentication: async (credential, options) => {
        captured = { credential, options };
        return {
          data: [
            { id: "gpt-4.1-mini" },
            { id: "gpt-4.1-mini" },
            { id: "claude-sonnet-4" },
            { id: "gpt-image-2" },
            { id: "text-embedding-3-small" },
            { id: "gpt-4o-image" },
            { id: "happyhorse-1.1-t2v" },
            { id: "tts-1" },
            { id: "" },
            {},
          ],
        };
      },
    },
  };
  assert.deepEqual(await node.methods.loadOptions.getModels.call(ctx), [
    { name: "claude-sonnet-4", value: "claude-sonnet-4" },
    { name: "gpt-4.1-mini", value: "gpt-4.1-mini" },
  ]);
  assert.equal(captured.credential, "aceDataChatApi");
  assert.equal(captured.options.method, "GET");
  assert.equal(captured.options.url, "https://api.acedata.cloud/v1/models");
  assert.equal(captured.options.timeout, 30000);
  assert.equal(node.description.properties[0].type, "options");
  assert.equal(
    node.description.properties[0].typeOptions.loadOptionsMethod,
    "getModels",
  );
});

test("catalog failures remain errors and never insert a fallback or change the saved model", async () => {
  for (const response of [
    {},
    { data: null },
    { data: [{ id: "gpt-image-2" }] },
  ]) {
    await assert.rejects(
      node.methods.loadOptions.getModels.call({
        helpers: { httpRequestWithAuthentication: async () => response },
      }),
      /catalog|No chat models/,
    );
  }
  const denied = new Error("403 model-list access denied");
  await assert.rejects(
    node.methods.loadOptions.getModels.call({
      helpers: {
        httpRequestWithAuthentication: async () => {
          throw denied;
        },
      },
    }),
    /403/,
  );
  assert.equal(node.description.properties[0].default, "gpt-4.1-mini");
});
