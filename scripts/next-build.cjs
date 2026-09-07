const { randomBytes } = require("node:crypto");
const { spawnSync } = require("node:child_process");

// Next evaluates auth-backed routes while collecting pages. Keep local builds
// deterministic without ever persisting a fallback secret or using it at runtime.
const env = { ...process.env };
if (!env.BETTER_AUTH_SECRET) env.BETTER_AUTH_SECRET = randomBytes(32).toString("hex");

const nextBin = require.resolve("next/dist/bin/next");
const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env,
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
