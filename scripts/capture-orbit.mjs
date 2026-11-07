import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const options = Object.fromEntries(
  process.argv.slice(2).map((argument) => {
    const [key, ...value] = argument.replace(/^--/, "").split("=");
    return [key, value.join("=")];
  })
);

const width = Number(options.width || 1440);
const height = Number(options.height || 1000);
const output = options.output;
const url = options.url || "http://localhost:3000/";
const motion = options.motion || "reduce";
const chromePath =
  options.chrome || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

if (!output) {
  throw new Error("Pass an output path with --output=path/to/screenshot.png");
}

const profilePath = await mkdtemp(join(tmpdir(), "valnex-orbit-capture-"));
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--disable-extensions",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${profilePath}`,
    `--window-size=${width},${height}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);
const chromeClosed = new Promise((resolve) => chrome.once("exit", resolve));

const sleep = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));

async function readDebugPort() {
  const portFile = join(profilePath, "DevToolsActivePort");
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const [port] = (await readFile(portFile, "utf8")).trim().split("\n");
      return port;
    } catch {
      await sleep(100);
    }
  }

  throw new Error("Chrome did not expose a DevTools port");
}

async function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const pending = new Map();
  const eventWaiters = new Map();
  let nextId = 0;

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
      return;
    }

    const waiters = eventWaiters.get(message.method);
    if (!waiters?.length) return;
    eventWaiters.delete(message.method);
    waiters.forEach((resolve) => resolve(message.params));
  });

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  return {
    send(method, params = {}) {
      const id = ++nextId;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
      });
    },
    waitFor(method) {
      return new Promise((resolve) => {
        const waiters = eventWaiters.get(method) || [];
        waiters.push(resolve);
        eventWaiters.set(method, waiters);
      });
    },
    close() {
      socket.close();
    },
  };
}

let client;

try {
  const port = await readDebugPort();
  const target = await fetch(`http://127.0.0.1:${port}/json/new`, {
    method: "PUT",
  }).then((response) => response.json());

  client = await connect(target.webSocketDebuggerUrl);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `try { sessionStorage.setItem("vx-intro", "1"); } catch {}`,
  });
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 640,
  });
  await client.send("Emulation.setEmulatedMedia", {
    features: [
      {
        name: "prefers-reduced-motion",
        value: motion === "full" ? "no-preference" : "reduce",
      },
    ],
  });

  const loaded = client.waitFor("Page.loadEventFired");
  await client.send("Page.navigate", { url });
  await loaded;

  await client.send("Runtime.evaluate", {
    expression: `(() => {
      const section = document.querySelector("#products");
      if (!section) throw new Error("#products was not rendered");
      section.scrollIntoView({ block: "start" });
    })()`,
  });

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const ready = await client.send("Runtime.evaluate", {
      expression: `(() => {
        const section = document.querySelector("#products");
        const heading = section?.querySelector("h2");
        const satellite = section?.querySelector("button[title]");
        return Boolean(
          heading &&
          satellite &&
          Number(getComputedStyle(heading).opacity) > 0.9 &&
          satellite.style.transform
        );
      })()`,
      returnByValue: true,
    });
    if (ready.result.value) break;
    await sleep(100);
  }

  await sleep(750);

  if (options.action === "next") {
    await client.send("Runtime.evaluate", {
      expression: `document.querySelector('#products button[aria-label="Next product"]')?.click()`,
    });
    await sleep(Number(options.delay || 550));
  }

  const boundsResult = await client.send("Runtime.evaluate", {
    expression: `(() => {
      const rect = document.querySelector("#products").getBoundingClientRect();
      return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      };
    })()`,
    returnByValue: true,
  });
  const bounds = boundsResult.result.value;
  const screenshot = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
    clip: { ...bounds, scale: 1 },
  });

  await writeFile(output, Buffer.from(screenshot.data, "base64"));
  console.log(`Captured ${Math.round(bounds.width)}x${Math.round(bounds.height)} to ${output}`);
} finally {
  if (client) {
    try {
      await client.send("Browser.close");
    } catch {
      client.close();
    }
  }
  await Promise.race([chromeClosed, sleep(3000)]);
  if (chrome.exitCode === null) chrome.kill();

  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      await rm(profilePath, { recursive: true, force: true });
      break;
    } catch (error) {
      if (error.code !== "EBUSY" || attempt === 9) throw error;
      await sleep(200);
    }
  }
}
