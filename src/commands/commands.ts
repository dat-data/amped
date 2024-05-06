import {
  CommandInteraction,
  ChatInputApplicationCommandData,
  AutocompleteInteraction,
} from "discord.js";
import { serverList } from "../commands/server.list";
import { startServer } from "../commands/start.server";
import { restartServer } from "../commands/restart.server";
import { stopServer } from "../commands/stop.server";
import { updateServer } from "../commands/update.server";
import { backupServer } from "../commands/backup.server";
import { Bot } from "../types/bot";
import { serverInfo } from "../commands/server.info";
import { serverSettings } from "../commands/server.settings";

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
  restartServer,
  stopServer,
  updateServer,
  backupServer,
];
