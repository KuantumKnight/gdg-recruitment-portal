const { randomBytes } = require("node:crypto");
const { spawnSync } = require("node:child_process");

// Next evaluates auth-backed routes while collecting pages. Keep local builds
// deterministic without ever persisting a fallback secret or using it at runtime.
const env = { ...process.env };
if (!env.BETTER_AUTH_SECRET) env.BETTER_AUTH_SECRET = randomBytes(32).toString("hex");

const command = process.platform === "win32" ? "next.cmd" : "next";
const result = spawnSync(command, ["build"], { stdio: "inherit", env, shell: true });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
