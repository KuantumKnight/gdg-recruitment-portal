const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const serverApp = path.join(root, ".next", "server", "app");
const staticRoot = path.join(root, ".next", "static");
const publicRoot = path.join(root, "public");
const out = path.join(root, "out");

const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
};
const clean = (target) => fs.rmSync(target, { recursive: true, force: true });

if (!fs.existsSync(path.join(serverApp, "index.html"))) {
  throw new Error("Next build did not produce the prerendered homepage");
}
clean(out);
fs.mkdirSync(out, { recursive: true });

const routes = [
  ["index.html", "index.html"],
  ["departments.html", "departments/index.html"],
  ["development.html", "development/index.html"],
  ["auth/signin.html", "auth/signin/index.html"],
  ["auth/signout.html", "auth/signout/index.html"],
  ["_not-found.html", "404.html"],
];
for (const [source, destination] of routes) {
  const from = path.join(serverApp, source);
  if (fs.existsSync(from)) copy(from, path.join(out, destination));
}
if (fs.existsSync(staticRoot)) copy(staticRoot, path.join(out, "_next", "static"));
if (fs.existsSync(publicRoot)) copy(publicRoot, out);
const icon = path.join(serverApp, "icon.svg.body");
const favicon = path.join(serverApp, "favicon.ico.body");
if (fs.existsSync(icon)) copy(icon, path.join(out, "icon.svg"));
if (fs.existsSync(favicon)) copy(favicon, path.join(out, "favicon.ico"));
console.log(`Prepared Sites static output in ${out}`);
