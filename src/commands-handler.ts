import path from "path";
import fs from "fs";
import { CacheType, Collection, CommandInteraction } from "discord.js";
import { Command } from "../types/index";

export class CommandsHandler {
  private commands: Collection<string, Command> = new Collection();

  public async execute(interaction: CommandInteraction<CacheType>) {
    try {
      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
      return;
    }
  }

  public async init() {
    const commandsPath = path.join(__dirname, "commands");
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith("cmd.ts"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const imported: any = await import(filePath);
      const command: Command = imported.default;
      this.commands.set(command.data.name, command);
    }
  }
}
