export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: any) => Promise<void | any>;
}
