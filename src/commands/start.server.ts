import {
  ApplicationCommandType,
  CommandInteraction,
  GuildMember,
  TextChannel,
  AutocompleteInteraction,
  ApplicationCommandOptionType,
} from "discord.js";
import { Command } from "./commands.js";
import { AppState } from "../types/instance.js";
import { getStatusIcon } from "../util/status.js";
import { Bot } from "src/types/bot.js";

export const startServer: Command = {
  name: "start-server",
  description: "Start server from list",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "servers",
      type: ApplicationCommandOptionType.String,
      description: "Select a server to start",
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

    let instance = await client.services.ampService?.getInstance(instanceId);
    let serverUpdate = await client.services.ampService?.getServerUpdate(
      instanceId
    );

    if (!instance) {
      await interaction.followUp({
        content: `Server ${instanceId} not found!`,
      });
      console.log(
        `Bot command ${interaction.commandName}: used by ${member.displayName}, no server ${instanceId} found`
      );
      return;
    } else if (instance.AppState === AppState.Ready) {
      await interaction.followUp({
        content: `Server **${instance.FriendlyName}** is already running?`,
      });
      console.log(
        `Bot command ${interaction.commandName}: used by ${
          member.displayName
        } but current server status is ${AppState[instance.AppState]}`
      );
      return;
    }

    await client.services.ampService?.startInstance(instance.InstanceName);

    await interaction.followUp({
      content: `Requested to start **${instance.FriendlyName}**, starting soon...`,
    });

    // Start instance and wait for it to be ready
    let instanceAttempts = 0;
    while (!instance?.Running && instanceAttempts <= 6) {
      console.log("Waiting for instance to start...");
      await new Promise((resolve) => setTimeout(resolve, 8000));
      instance = await client.services.ampService?.getInstance(instanceId);
      instanceAttempts++;
    }

    await client.services.ampService?.startServer(instanceId);

    let serverAttempts = 0;
    while (serverUpdate?.Status.State !== AppState.Ready) {
      console.log("Waiting for server to start...");
      await new Promise((resolve) => setTimeout(resolve, 8000));
      serverUpdate = await client.services.ampService?.getServerUpdate(
        instanceId
      );
      serverAttempts++;
    }
    if (serverUpdate?.Status.State == AppState.Ready) {
      const icon = getStatusIcon(serverUpdate.Status.State);
      await channel.send(
        `**${instance!.FriendlyName}** started successfully, status: ${icon} ${
          AppState[serverUpdate.Status.State]
        }`
      );
    }

    console.log(
      `Bot command ${interaction.commandName}: used by ${member.displayName} in channel ${channel.name}`
    );
  },
};
