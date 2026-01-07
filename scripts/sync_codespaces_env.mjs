import fs from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";

const ENV_PATH = new URL("../.env", import.meta.url);
const WAIT_FLAG = "--wait";
const DEFAULT_MAX_WAIT_MS = 60_000;
const DEFAULT_INTERVAL_MS = 2_000;

const codespaceName = process.env.CODESPACE_NAME;
const portForwardDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;

const shouldWait = process.argv.includes(WAIT_FLAG);

const buildCodespacesUrl = () => {
  if (!codespaceName || !portForwardDomain) {
    return null;
  }
  return `https://${codespaceName}-8000.${portForwardDomain}`;
};

const checkLocalServer = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1_500);
  try {
    const response = await fetch("http://localhost:8000", {
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

const waitForLocalServer = async () => {
  const maxWaitMs = Number.parseInt(
    process.env.CODESPACES_ENV_SYNC_MAX_WAIT_MS ?? "",
    10,
  );
  const intervalMs = Number.parseInt(
    process.env.CODESPACES_ENV_SYNC_INTERVAL_MS ?? "",
    10,
  );
  const deadline = Date.now() + (Number.isFinite(maxWaitMs) ? maxWaitMs : DEFAULT_MAX_WAIT_MS);
  const interval = Number.isFinite(intervalMs) ? intervalMs : DEFAULT_INTERVAL_MS;

  while (Date.now() < deadline) {
    if (await checkLocalServer()) {
      return true;
    }
    await sleep(interval);
  }
  return false;
};

const updateEnvFile = async (url) => {
  let content = "";
  try {
    content = await fs.readFile(ENV_PATH, "utf8");
  } catch {
    content = "";
  }

  const lines = content.split(/\r?\n/);
  let updated = false;
  const nextLines = lines.map((line) => {
    if (!line.trim().startsWith("VITE_API_URL")) {
      return line;
    }
    updated = true;
    return `VITE_API_URL="${url}"`;
  });

  if (!updated) {
    if (nextLines.length > 0 && nextLines[nextLines.length - 1] !== "") {
      nextLines.push("");
    }
    nextLines.push(`VITE_API_URL="${url}"`);
  }

  await fs.writeFile(ENV_PATH, nextLines.join("\n"));
};

const main = async () => {
  const codespacesUrl = buildCodespacesUrl();
  if (!codespacesUrl) {
    console.log("Codespaces environment not detected. Skipping .env update.");
    return;
  }

  const isOnline = shouldWait ? await waitForLocalServer() : await checkLocalServer();
  if (!isOnline) {
    console.log("localhost:8000 is not reachable. Skipping .env update.");
    return;
  }

  await updateEnvFile(codespacesUrl);
  console.log(`Updated VITE_API_URL in .env to ${codespacesUrl}`);
};

await main();
