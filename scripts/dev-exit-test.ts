import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectDir = path.join(__dirname, "..");
const command = process.platform === "win32" ? "npm.cmd" : "npm";

const child = spawn(command, ["run", "dev"], {
  cwd: projectDir,
  stdio: "inherit",
});

setTimeout(() => {
  console.log("Stopping dev server...");
  child.kill("SIGINT");
}, 8000);

child.on("exit", (code, signal) => {
  console.log("Dev server exited", { code, signal });
  process.exit(code ?? 0);
});
