import {
  ApplicationCommandType,
  CommandInteraction,
  GuildMember,
  TextChannel,
  APIEmbed,
  Colors,
  AutocompleteInteraction,
  ApplicationCommandOptionType,
} from "discord.js";
import { Command } from "./commands.js";
import { AppState, SettingsReference } from "../types/instance.js";
import { getStatusIcon } from "../util/status.js";
import { Bot } from "src/types/bot.js";

export const serverInfo: Command = {
  name: "server-info",
  description: "Display info for a server",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "servers",
      type: ApplicationCommandOptionType.String,
      description: "Select a server for info",
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
    const serverUpdate = await client.services.ampService?.getServerUpdate(
      instanceId
    );

    if (instance && serverSettings) {
      // Handle settings
      let connectionRef;
      let serverName;
      let serverDescription;
      let password;

      const ref = SettingsReference[instance.ModuleDisplayName];
      if (ref && ref.Connection) {
        connectionRef = serverSettings[ref.Connection.Settings];
        password = connectionRef?.find(
          (s: any) => s.Name === ref.Connection!.Password
        )?.CurrentValue;
        serverName = connectionRef?.find(
          (s: any) => s.Name === ref.Connection!.ServerName
        )?.CurrentValue;
        serverDescription = connectionRef?.find(
          (s: any) => s.Name === ref.Connection!.ServerDescription
        )?.CurrentValue;
      }

      const uptime = serverUpdate?.Status.Uptime ?? "00:00";

      // Build embed
      const embed: APIEmbed = {
        color: Colors.White,
        title: `${instance.FriendlyName}`,
        fields: [],
      };

      const status = instance.AppState;
      const icon = getStatusIcon(status);
      let statusValue = AppState[status];
      if (icon) statusValue = `${icon} ${statusValue}`;
      let endpoint = instance.ApplicationEndpoints.find(
        (e) => e.DisplayName === "Application Address"
      );
      let ip = endpoint?.Endpoint.replace("0.0.0.0", process.env.AMP_BASEURL!);

      if (serverName) {
        embed.fields?.push({
          name: `Server Name`,
          value: `${serverName}`,
          inline: false,
        });
      }

      if (serverDescription) {
        embed.fields?.push({
          name: `Server Description`,
          value: `${serverDescription}`,
          inline: false,
        });
      }

      embed.fields?.push(
        // {
        //   name: `** **`,
        //   value: ``,
        // },
        {
          name: `Status`,
          value: `${statusValue}`,
          inline: false,
        },
        {
          name: `Uptime`,
          value: `${uptime}`,
          inline: false,
        },
        {
          name: `Active Users`,
          value: `${instance.Metrics["Active Users"].RawValue}/${instance.Metrics["Active Users"].MaxValue}`,
          inline: false,
        },
        // {
        //   name: `** **`,
        //   value: ``,
        // },
        {
          name: `CPU`,
          value: `${instance.Metrics["CPU Usage"].Percent}%`,
          inline: false,
        },
        {
          name: `Memory`,
          value: `${instance.Metrics["Memory Usage"].Percent}%`,
          inline: false,
        },
        // {
        //   name: `** **`,
        //   value: ``,
        // },
        {
          name: `IP`,
          value: `\`\`\`${ip}\`\`\``,
          inline: false,
        }
      );

      if (password) {
        embed.fields?.push({
          name: `Password`,
          value: `\`\`\`${password}\`\`\``,
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
