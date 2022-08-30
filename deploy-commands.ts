import path from "path";
import { CommandsHandler } from "./commands-handler";

async function main() {
  const deployer = new CommandsHandler(path.join(__dirname, "src/commands"));
  await deployer.deployCommands();
}

main();
