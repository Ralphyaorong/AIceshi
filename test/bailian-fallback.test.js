const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { requestAiWithFallback } = require("../server.js");

function loadSavedFallbackReport() {
  const reportsPath = path.join(__dirname, "..", "data", "reports.json");
  const reports = JSON.parse(fs.readFileSync(reportsPath, "utf8"));
  const savedReport = reports.r_db93108c2026086e;

  assert.ok(savedReport, "expected saved report fixture");
  assert.match(savedReport.generatedAt, /^2026-05-29T/);
  assert.equal(savedReport.provider, "bailian");
  assert.equal(savedReport.models[0], "qwen-does-not-exist");
  return savedReport;
}

test("continues through Bailian fallback models for saved report r_db93108c2026086e", async () => {
  const savedReport = loadSavedFallbackReport();

  assert.equal(savedReport.model, savedReport.models[1]);

  const seenModels = [];
  const responses = [
    {
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          code: "model_not_found",
          param: "model",
          message: "Requested resource is unavailable for this account.",
        },
      }),
    },
    {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: "# recovered via fallback",
            },
          },
        ],
      }),
    },
  ];

  const result = await requestAiWithFallback({
    messages: [
      { role: "system", content: "test" },
      { role: "user", content: [{ type: "text", text: "test" }] },
    ],
    modelCandidates: savedReport.models,
    baseUrl: "https://example.invalid/v1",
    apiKey: "test-key",
    fetchImpl: async (_url, init) => {
      const requestBody = JSON.parse(init.body);
      seenModels.push(requestBody.model);
      return responses.shift();
    },
  });

  assert.deepEqual(seenModels, savedReport.models.slice(0, 2));
  assert.equal(result.model, savedReport.model);
  assert.equal(result.fallbackUsed, true);
  assert.equal(result.content, "# recovered via fallback");
  assert.deepEqual(result.attemptedModels, savedReport.models.slice(0, 2));
});

test("continues through saved Bailian fallback models when a model failure is thrown", async () => {
  const savedReport = loadSavedFallbackReport();

  const seenModels = [];

  const result = await requestAiWithFallback({
    messages: [
      { role: "system", content: "test" },
      { role: "user", content: [{ type: "text", text: "test" }] },
    ],
    modelCandidates: savedReport.models,
    baseUrl: "https://example.invalid/v1",
    apiKey: "test-key",
    fetchImpl: async (_url, init) => {
      const requestBody = JSON.parse(init.body);
      seenModels.push(requestBody.model);

      if (requestBody.model === savedReport.models[0]) {
        const error = new Error("The model `qwen-does-not-exist` does not exist or you do not have access to it.");
        error.status = 400;
        throw error;
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: "# recovered after thrown model failure",
              },
            },
          ],
        }),
      };
    },
  });

  assert.deepEqual(seenModels, savedReport.models.slice(0, 2));
  assert.equal(result.model, savedReport.model);
  assert.equal(result.fallbackUsed, true);
  assert.equal(result.content, "# recovered after thrown model failure");
  assert.deepEqual(result.attemptedModels, savedReport.models.slice(0, 2));
});
