import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { dirname, extname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Model GitHub project Pages: only /Easycop/ exists, and missing files are 404s.
// Serve the production build directly, without Vite's development fallbacks.
const root = await realpath(
  resolve(dirname(fileURLToPath(import.meta.url)), "../dist"),
);
const prefix = "/Easycop/";
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};
const isWithinRoot = (path) => {
  const remainder = relative(root, path);
  return (
    remainder !== ".." && !remainder.startsWith("../") && !isAbsolute(remainder)
  );
};

const server = createServer(async (request, response) => {
  const fail = (status, message) => {
    response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(message);
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    fail(405, "Method not allowed");
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(request.url, "http://127.0.0.1").pathname,
    );
  } catch {
    fail(400, "Invalid path");
    return;
  }
  if (pathname === "/Easycop") {
    response.writeHead(308, { Location: prefix });
    response.end();
    return;
  }
  if (!pathname.startsWith(prefix) || pathname.includes("\0")) {
    fail(404, "Not found");
    return;
  }
  const path = resolve(root, pathname.slice(prefix.length) || "index.html");
  if (!isWithinRoot(path)) {
    fail(404, "Not found");
    return;
  }
  try {
    const actualPath = await realpath(path);
    if (!isWithinRoot(actualPath) || !(await stat(actualPath)).isFile()) {
      fail(404, "Not found");
      return;
    }
    const content = await readFile(actualPath);
    response.writeHead(200, {
      "Content-Type":
        mimeTypes[extname(actualPath)] || "application/octet-stream",
      "Content-Length": content.length,
      "Cache-Control": "no-store",
    });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch {
    fail(404, "Not found");
  }
});

server.listen(4174, "127.0.0.1", () => {
  console.log("Serving production dist under /Easycop/ on port 4174");
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
