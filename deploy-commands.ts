import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Command } from "./types";

async function deployCommands() {
  const commands: any[] = [];
  const commandsPath = path.join(__dirname, "src/commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith("cmd.ts"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const imported = await import(filePath);
    const command: Command = imported.default;
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "9" }).setToken(
    `${process.env.DISCORD_TOKEN}`
  );

  rest
    .put(
      Routes.applicationGuildCommands(
        `${process.env.CLIENT_ID}`,
        `${process.env.GUILD_ID}`
      ),
      { body: commands }
    )
    .then(() => console.log("Successfully registered application commands."))
    .catch(console.error);
}

deployCommands();
