import path from "path";
import { BuildType, CommandsHandler } from "../src/classes";

// Get Package.json Args with build info and pass it to deployCommands

async function main() {
  const buildArg = process.argv.find((arg) => arg.startsWith("build"));
  if (!buildArg)
    throw new Error(
      "`build` argument is missing, add `build=dev` or `build=prod` to specify build"
    );

  let build: BuildType;

  switch (buildArg.split("build=")[1]) {
    case "dev":
      build = BuildType.DEV;
      break;
    case "prod":
      build = BuildType.PRODUCTION;
      break;
    default:
      throw new Error("Unknown build type (use `dev` or `prod`)");
  }

  const handler = new CommandsHandler(path.join(__dirname, "../src/commands"));
  await handler.deployCommands({ global: true, build });
}

main();
