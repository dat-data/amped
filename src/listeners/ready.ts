import { Bot } from "../types/bot";
import { ApplicationCommands } from "../commands/commands";

export default function (client: Bot): void {
  client.on("ready", async () => {
    if (!client.user || !client.application) return;

    console.log("Registering commands");
    await client.application?.commands.set(ApplicationCommands);

    console.log("Bot is ready");
  });
}
