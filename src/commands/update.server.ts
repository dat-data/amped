import {
  ApplicationCommandType,
  CommandInteraction,
  GuildMember,
  TextChannel,
  AutocompleteInteraction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../commands/commands";
import { AppState } from "../types/instance";
import { getStatusIcon } from "../util/status";
import { Bot } from "../types/bot";

export const updateServer: Command = {
  name: "update-server",
  description: "Update server from list",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "servers",
      type: ApplicationCommandOptionType.String,
      description: "Select a server to update",
      autocomplete: true,
      required: true,
    },
  ],
  ephemeral: false,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
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

    let instance = await client.services.ampService?.getInstance(instanceId);
    let serverUpdate = await client.services.ampService?.getServerUpdate(
      instanceId
    );

    if (!instance) {
      await interaction.followUp({
        content: `Server ${instanceId} not found!`,
      });
      console.log(
        `Bot command ${interaction.commandName}: used by ${member.displayName}, no instance ${instanceId} found`
      );
      return;
    } else if (instance.AppState === AppState.Updating) {
      await interaction.followUp({
        content: `Server **${instance.FriendlyName}** is already updating?`,
      });
      console.log(
        `Bot command ${interaction.commandName}: used by ${
          member.displayName
        } but current server status is ${AppState[instance.AppState]}`
      );
      return;
    }

    await client.services.ampService?.updateServer(instance.InstanceID);

    await interaction.followUp({
      content: `Requested to update **${instance.FriendlyName}**, updating soon...`,
    });

    let serverAttempts = 0;
    while (
      serverUpdate?.Status.State !== AppState.Ready &&
      serverAttempts < 10
    ) {
      console.log("Waiting for server to update...");
      await new Promise((resolve) => setTimeout(resolve, 10000));
      serverUpdate = await client.services.ampService?.getServerUpdate(
        instanceId
      );
      serverAttempts++;
    }
    if (serverUpdate?.Status.State == AppState.Stopped) {
      const icon = getStatusIcon(serverUpdate.Status.State);
      await channel.send(
        `**${instance!.FriendlyName}** updated successfully, status: ${icon} ${
          AppState[serverUpdate.Status.State]
        }`
      );
    }

    console.log(
      `Bot command ${interaction.commandName}: used by ${member.displayName} in channel ${channel.name}`
    );

    await client.services.channelServerService?.updateChannelEmbeds(
      client.channels.cache,
      client.services.ampService!
    );
  },
};
