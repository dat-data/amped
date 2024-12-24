import {
  APIEmbed,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Channel,
  ChannelType,
  Collection,
  Colors,
  ComponentType,
  TextChannel,
} from "discord.js";
import { AmpService } from "../services/amp.service";
import { AppState, Instance, SettingsReference } from "../types/instance";
import { getStatusIcon } from "../util/status";
import { convertToSeconds } from "../util/seconds";

export class ChannelServerService {
  constructor() {}

  async updateChannelEmbeds(
    channels: Collection<string, Channel>,
    amp: AmpService
  ): Promise<void> {
    const instances = await amp.getInstances();
    const textChannels = channels.filter(
      (c) => c.type === ChannelType.GuildText
    ) as Collection<string, TextChannel>;

    for (const instance of instances) {
      const channelServerName = process.env.GAME_SERVERS_CHANNEL!;
      const channel = textChannels.find((c) => c.name === channelServerName);

      if (channel) {
        const embedContent = await this.getEmbedContent(instance, amp);
        if (embedContent) {
          const row = await this.getActionRow(
            instance.InstanceID,
            instance.AppState
          );
          const messages = (await channel.messages.fetch({ limit: 25 })).filter(
            (m) => m.author.id === channel.client.user?.id
          );
          const message = messages.find(
            (m) => m.embeds[0].title === instance.FriendlyName
          );
          if (message) {
            await message.edit({
              embeds: [embedContent],
              components: [row],
            });
          } else {
            await channel.send({
              embeds: [embedContent],
              components: [row],
            });
          }
        }
      }
    }
  }

  // @deprecated
  async updateChannelSpecificEmbeds(
    channels: Collection<string, Channel>,
    amp: AmpService
  ): Promise<void> {
    const instances = await amp.getInstances();
    const textChannels = channels.filter(
      (c) => c.type === ChannelType.GuildText
    ) as Collection<string, TextChannel>;

    for (const instance of instances) {
      const channelServerName = await this.getChannelServerName(
        instance.ModuleDisplayName
      );
      const channel = textChannels.find((c) => c.name === channelServerName);

      if (channel) {
        const embedContent = await this.getEmbedContent(instance, amp);
        if (embedContent) {
          const row = await this.getActionRow(
            instance.InstanceID,
            instance.AppState
          );
          const messages = (await channel.messages.fetch({ limit: 10 })).filter(
            (m) => m.author.id === channel.client.user?.id
          );

          if (messages.size != 0) {
            messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            await messages.first()?.edit({
              embeds: [embedContent],
              components: [row],
            });
          } else {
            await channel.send({
              embeds: [embedContent],
              components: [row],
            });
          }
        }
      }
    }
  }

  private async getChannelServerName(serverName: string): Promise<string> {
    return serverName.replaceAll(" ", "-").toLowerCase();
  }

  private async getEmbedContent(
    instance: Instance,
    amp: AmpService
  ): Promise<APIEmbed | undefined> {
    const serverSettings = await amp.getServerSettings(instance.InstanceID);
    const serverUpdate = await amp.getServerUpdate(instance.InstanceID);

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

      let uptime = "00:00";
      if (serverUpdate && serverUpdate.Title == "Instance Unavailable") {
        uptime = `Instance Unavailable`;
      } else if (
        serverUpdate &&
        serverUpdate.Status.State == AppState.Ready &&
        serverUpdate?.Status.Uptime
      ) {
        const totalSeconds = convertToSeconds(serverUpdate.Status.Uptime);
        uptime = `<t:${
          Math.floor(new Date().getTime() / 1000) - totalSeconds
        }:R>`;
      }

      // Build embed
      const embed: APIEmbed = {
        color: Colors.White,
        title: `${instance.FriendlyName}`,
        fields: [],
      };

      const status =
        serverUpdate?.Status != undefined
          ? serverUpdate?.Status.State
          : AppState.Stopped;
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
          value: `\`\`\`${serverName}\`\`\``,
        });
      }

      if (serverDescription) {
        embed.fields?.push({
          name: `Server Description`,
          value: `${serverDescription}`,
        });
      }

      const activeUsersRaw =
        instance.Metrics["Active Users"] != undefined
          ? instance.Metrics["Active Users"].RawValue
          : 0;
      const activeUsersMax =
        instance.Metrics["Active Users"] != undefined
          ? instance.Metrics["Active Users"].MaxValue
          : 0;
      const cpuUsage =
        instance.Metrics["CPU Usage"] != undefined
          ? instance.Metrics["CPU Usage"].Percent
          : 0;
      const memoryUsage =
        instance.Metrics["Memory Usage"] != undefined
          ? instance.Metrics["Memory Usage"].Percent
          : 0;

      embed.fields?.push(
        // {
        //   name: `** **`,
        //   value: ``,
        // },
        {
          name: `Status`,
          value: `${statusValue}`,
        },
        {
          name: `Running Since`,
          value: `${uptime}`,
        },
        {
          name: `Active Users`,
          value: `${activeUsersRaw}/${activeUsersMax}`,
        },
        // {
        //   name: `** **`,
        //   value: ``,
        // },
        {
          name: `CPU`,
          value: `${cpuUsage}%`,
        },
        {
          name: `Memory`,
          value: `${memoryUsage}%`,
        },
        // {
        //   name: `** **`,
        //   value: ``,
        // },
        {
          name: `IP`,
          value: `\`\`\`${ip}\`\`\``,
        }
      );

      if (password) {
        embed.fields?.push({
          name: `Password`,
          value: `\`\`\`${password}\`\`\``,
        });
      }

      embed.fields?.push({
        name: `Last Updated`,
        value: `<t:${Math.floor(new Date().getTime() / 1000)}:R>`,
      });

      return embed;
    }
  }

  private async getActionRow(
    instanceId: string,
    state: AppState
  ): Promise<ActionRowBuilder<ButtonBuilder>> {
    return new ActionRowBuilder<ButtonBuilder>({
      components: [
        new ButtonBuilder({
          type: ComponentType.Button,
          style: ButtonStyle.Success,
          label: "Start",
          customId: `start_${instanceId}`,
          disabled: state != AppState.Stopped,
          emoji: "▶️",
        }),
        new ButtonBuilder({
          type: ComponentType.Button,
          style: ButtonStyle.Primary,
          label: "Refresh",
          customId: `refresh_${instanceId}`,
          emoji: "🔄",
        }),
      ],
    });
  }
}
