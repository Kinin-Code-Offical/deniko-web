import { auth } from "../auth";

async function main() {
  console.log("Testing Auth Import...");
  try {
    console.log("Auth configuration loaded:", !!auth);
    console.log("Auth Import Successful!");
  } catch (error) {
    console.error("Auth Import Failed:", error);
  }
}

main();
