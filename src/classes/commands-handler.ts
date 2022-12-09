import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import {
  CacheType,
  Collection,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Command } from "../interfaces";

export enum BuildType {
  PRODUCTION,
  DEV,
}

type DeployCommandsOptions = {
  /**
   * Should deploy to test-server or globally
   */
  global: boolean;

  /**
   * Deploy commands to Mooty or MootyTest
   */
  build: BuildType;
};

export class CommandsHandler {
  private commandPaths: string[];
  private commandsJSON: any[];
  private commandsFolderPath: string;

  public commands: Collection<string, Command>;
  constructor(commandsFolderPath: string) {
    this.commandPaths = [];
    this.commandsJSON = [];
    this.commandsFolderPath = commandsFolderPath;

    this.commands = new Collection();
  }

  async deployCommands({ global, build }: DeployCommandsOptions) {
    console.info(
      `Deploy commands ${global ? "globally" : ""} to ${
        build === BuildType.DEV ? "development" : "production"
      } build ...`
    );

    if (!fs.existsSync(this.commandsFolderPath))
      throw new Error(`Path: ${this.commandsFolderPath} does not exist`);

    const paths = this.readDirectory(this.commandsFolderPath);

    for (const commandPath of paths) {
      this.readPath(path.join(this.commandsFolderPath, commandPath));
    }

    // Here we have filled array with command paths, lets create commands
    for (const commandFilePath of this.commandPaths) {
      const imported = await import(commandFilePath);
      const command: Command = imported.default;
      this.commandsJSON.push(command.data.toJSON());
    }

    let token: string;
    let clientId: string;

    switch (build) {
      case BuildType.PRODUCTION:
        if (!process.env.DISCORD_PROD_TOKEN)
          throw new Error(
            `Bad DISCORD_PROD_TOKEN: ${process.env.DISCORD_PROD_TOKEN}`
          );

        if (!process.env.DISCORD_PROD_CLIENT_ID)
          throw new Error(
            `Bad DISCORD_PROD_CLIENT_ID: ${process.env.DISCORD_PROD_CLIENT_ID}`
          );

        token = `${process.env.DISCORD_PROD_TOKEN}`;
        clientId = `${process.env.DISCORD_PROD_CLIENT_ID}`;
        break;
      case BuildType.DEV:
        if (!process.env.DISCORD_DEV_TOKEN)
          throw new Error(
            `Bad DISCORD_DEV_TOKEN: ${process.env.DISCORD_DEV_TOKEN}`
          );

        if (!process.env.DISCORD_DEV_CLIENT_ID)
          throw new Error(
            `Bad DISCORD_DEV_CLIENT_ID: ${process.env.DISCORD_DEV_CLIENT_ID}`
          );

        token = `${process.env.DISCORD_DEV_TOKEN}`;
        clientId = `${process.env.DISCORD_DEV_CLIENT_ID}`;
        break;
      default:
        throw new Error("Bad token");
    }

    console.log("token:", token);
    const rest = new REST({ version: "9" }).setToken(token);

    rest
      .put(
        global
          ? Routes.applicationCommands(clientId)
          : Routes.applicationGuildCommands(
              clientId,
              `${process.env.GUILD_ID}`
            ),
        { body: this.commandsJSON }
      )
      .then(() =>
        console.log(
          `Successfully registered ${
            this.commandPaths.length
          } application commands ${global ? "globally" : ""}.`
        )
      )
      .catch(console.error);

    return;
  }

  /**
   * Load commands locally
   */
  public async loadCommands() {
    const paths = this.readDirectory(this.commandsFolderPath);

    for (const commandPath of paths) {
      this.readPath(path.join(this.commandsFolderPath, commandPath));
    }

    for (const commandPath of this.commandPaths) {
      const imported: any = await import(commandPath);
      const command: Command = imported.default;
      this.commands.set(command.data.name, command);
    }
  }

  // Change interaction type to base interaction class ?
  /**
   * Executes command
   * @param interaction Command interaction
   */
  public async execute(interaction: CommandInteraction<CacheType>) {
    try {
      const command = this.commands.get(interaction.commandName);
      if (!command) return await interaction.reply("Command not found");

      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      return await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }

  /**
   * Recursively reads all contents of commands folder and stores commands paths in memory
   * @param _path Path to directory or file
   */
  private readPath(_path: string) {
    if (!fs.existsSync(_path))
      throw new Error(`Path "${_path}" does not exist`);

    if (fs.lstatSync(_path).isDirectory()) {
      const innerPaths = this.readDirectory(_path);

      for (const innerPath of innerPaths)
        this.readPath(path.join(_path, innerPath));
    } else if (fs.lstatSync(_path).isFile())
      if (_path.endsWith(".cmd.ts") || _path.endsWith(".cmd.js"))
        // TODO: Upgrade this if-statement to use regex syntax like: "*.cmd.*"
        this.commandPaths.push(_path);
  }

  /**
   * Reads directory. If path is not directory - throws error
   * @param directoryPath path to directory
   * @returns array if inner files and directories
   */
  private readDirectory(directoryPath: string): string[] {
    if (
      !fs.existsSync(directoryPath) ||
      !fs.lstatSync(directoryPath).isDirectory()
    ) {
      throw new Error(
        "Failed to read directory. It does not exist or is not a directory"
      );
    }

    return fs.readdirSync(directoryPath);
  }
}
