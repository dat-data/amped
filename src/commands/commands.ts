import {
  CommandInteraction,
  ChatInputApplicationCommandData,
  AutocompleteInteraction,
} from "discord.js";
import { serverList } from "./server.list";
// import { startServer } from "./start.server";
// import { restartServer } from "./restart.server";
// import { stopServer } from "./stop.server";
// import { updateServer } from "./update.server";
// import { backupServer } from "./backup.server";
import { Bot } from "src/types/bot";

export interface Command extends ChatInputApplicationCommandData {
  ephemeral: boolean;
  autocomplete?: (
    client: Bot,
    interaction: AutocompleteInteraction
  ) => Promise<void>;
  run: (client: Bot, interaction: CommandInteraction) => void;
}

export const ApplicationCommands: Command[] = [
  // User commands
  serverList,
  // startServer,
  // game server info
  // Admin only commands
  // restartServer,
  // stopServer,
  // updateServer,
  // backupServer,
];
