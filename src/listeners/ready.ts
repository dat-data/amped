import { Bot } from "src/types/bot.js";
import { ApplicationCommands } from "../commands/commands.js";

export default function (client: Bot): void {
  client.on("ready", async () => {
    if (!client.user || !client.application) return;

    console.log("Registering commands");
    await client.application?.commands.set(ApplicationCommands);

    // if (!setup) {
    //   process.stdout.write("Running discord bot setup...");
    //   const avatarPath = "./avatar.png";
    //   client.user.setAvatar(avatarPath);
    //   client.user.setUsername("hacket");
    //   client.user.setActivity({
    //     type: ActivityType.Listening,
    //     name: "/server-list",
    //   });
    //   await globalThis.dbService.setDiscordBotInitialSetup(true);
    // }

    console.log("Bot is ready");
  });
}
