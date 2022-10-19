import path from "path";
import { CommandsHandler } from "../src/commands-handler";

async function main() {
  const handler = new CommandsHandler(path.join(__dirname, "../src/commands"));
  await handler.deployCommands({ global: false });
}

main();
