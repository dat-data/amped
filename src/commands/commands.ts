import {
  CommandInteraction,
  ChatInputApplicationCommandData,
  AutocompleteInteraction,
} from "discord.js";
import { serverList } from "./server.list.js";
import { startServer } from "./start.server.js";
// import { restartServer } from "./restart.server";
import { stopServer } from "./stop.server.js";
// import { updateServer } from "./update.server";
// import { backupServer } from "./backup.server";
import { Bot } from "src/types/bot.js";
import { serverInfo } from "./server.info.js";
import { serverSettings } from "./server.settings.js";

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
  serverInfo,
  serverSettings,
  startServer,
  // Admin only commands
  // restartServer,
  stopServer,
  // updateServer,
  // backupServer,
];
