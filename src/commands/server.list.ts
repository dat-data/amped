import {
  ApplicationCommandType,
  CommandInteraction,
  GuildMember,
  TextChannel,
  APIEmbed,
  Colors,
} from "discord.js";
import { Command } from "./commands.js";
import { AppState } from "../types/instance.js";
import { getStatusIcon } from "../util/status.js";
import { Bot } from "src/types/bot.js";

export const serverList: Command = {
  name: "server-list",
  description: "Display list of servers and their status",
  type: ApplicationCommandType.ChatInput,
  ephemeral: false,
  run: async (client: Bot, interaction: CommandInteraction) => {
    const member = interaction.member as GuildMember;
    const channel = interaction.channel as TextChannel;

    const embed: APIEmbed = {
      color: Colors.White,
      title: `Server List`,
      description: `List of servers available and their current status`,
      fields: [],
    };

    const instances = await client.services.ampService?.getInstances();
    if (instances) {
      for (const instance of instances.sort((a, b) =>
        a.FriendlyName.localeCompare(b.FriendlyName)
      )) {
        const status = instance.AppState;
        const icon = getStatusIcon(status);
        let statusValue = AppState[status];
        if (icon) statusValue = `${icon} ${statusValue}`;

        embed.fields?.push({
          name: instance.FriendlyName,
          value: `Status: ${statusValue}\nActive Users: ${instance.Metrics["Active Users"].RawValue}/${instance.Metrics["Active Users"].MaxValue}\nCPU: ${instance.Metrics["CPU Usage"].Percent}%\nMemory: ${instance.Metrics["Memory Usage"].Percent}%`,
          inline: false,
        });
      }

      await interaction.followUp({
        embeds: [embed],
      });
    }

    console.log(
      `Bot command ${interaction.commandName}: used by ${member.displayName} in channel ${channel.name}`
    );
  },
};
