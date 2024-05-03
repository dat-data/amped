import {
  ApplicationCommandType,
  CommandInteraction,
  GuildMember,
  TextChannel,
  AutocompleteInteraction,
  ApplicationCommandOptionType,
} from "discord.js";
import { Command } from "./commands.js";
import { SettingsReference } from "../types/instance.js";
import { getStatusIcon } from "../util/status.js";
import { Bot } from "src/types/bot.js";

export const serverSettings: Command = {
  name: "server-settings",
  description: "Display settings for a server",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "servers",
      type: ApplicationCommandOptionType.String,
      description: "Select a server to view settings",
      autocomplete: true,
      required: true,
    },
  ],
  ephemeral: false,
  autocomplete: async (client: Bot, interaction: AutocompleteInteraction) => {
    const focusedValue = interaction.options.getFocused();
    const instances = await client.services.ampService?.getInstances();
    let choices: { name: string; value: string }[] = [];
    if (instances) {
      choices = instances
        .sort((a, b) => a.FriendlyName.localeCompare(b.FriendlyName))
        .map((v) => {
          const status = getStatusIcon(v.AppState);
          return {
            name: `${v.FriendlyName} [${status}]`,
            value: v.InstanceID.toString(),
          };
        });
    }

    const filtered = choices.filter((choice) =>
      choice.name.toLowerCase().startsWith(focusedValue)
    );
    await interaction.respond(filtered.slice(0, 25));
  },
  run: async (client: Bot, interaction: CommandInteraction) => {
    const member = interaction.member as GuildMember;
    const channel = interaction.channel as TextChannel;
    const instanceId = interaction.options.data[0].value as string;

    const instance = await client.services.ampService?.getInstance(instanceId);
    const serverSettings = await client.services.ampService?.getServerSettings(
      instanceId
    );

    await interaction.followUp({
      content: `Settings dump for ${instance?.FriendlyName} incoming...`,
    });
    if (instance && serverSettings) {
      // Handle settings
      const ref = SettingsReference[instance.ModuleDisplayName];
      if (ref && ref.Settings) {
        for (const setting of ref.Settings) {
          const settingRef = serverSettings[setting];
          let content = "";
          if (settingRef) {
            content += `diff\n!${setting}\n`;
            for (const s of settingRef) {
              content += `${s.Name}: ${s.CurrentValue}\n`;
              // content += `Description: ${s.Description}\n\n`;
            }
          }
          interaction.channel?.send({
            content: `\`\`\`${content}\`\`\``,
          });
        }
      } else {
        interaction.channel?.send({
          content: `\`\`\`Settings were not found or are unavailable for this server.\`\`\``,
        });
      }
    }

    console.log(
      `Bot command ${interaction.commandName}: used by ${member.displayName} in channel ${channel.name}`
    );
  },
};
