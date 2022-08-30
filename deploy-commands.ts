import path from "path";
import { CommandsHandler } from "./commands-handler";

async function main() {
  const handler = new CommandsHandler(path.join(__dirname, "src/commands"));
  await handler.deployCommands();
}

main();
