export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: any) => any;
}
