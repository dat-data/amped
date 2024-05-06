import {
  ActionRowBuilder,
  ButtonBuilder,
  GuildMember,
  MessageComponentInteraction,
  TextChannel,
} from "discord.js";
import { Bot } from "../types/bot";
import { Button } from "../buttons/buttons";
import { AppState } from "../types/instance";

export const start: Button = {
  custom_id: "start",
  component_type: 2,
  run: async (client: Bot, interaction: MessageComponentInteraction) => {
    const member = interaction.member as GuildMember;
    const channel = interaction.channel as TextChannel;
    const instanceId = interaction.customId.split("_")[1];

    await interaction.deferUpdate();
    let row = interaction.message.components[0];
    const disabledButtons = row.components.map((button: any) =>
      ButtonBuilder.from(button).setDisabled(true)
    );

    await interaction.message.edit({
      embeds: [interaction.message.embeds[0]],
      components: [
        new ActionRowBuilder<ButtonBuilder>({
          components: [...disabledButtons],
        }),
      ],
    });

    await client.services.ampService?.startServer(instanceId);

    console.log(
      `Bot button start: used by ${member.displayName} in channel ${channel.name}`
    );

    let serverUpdate = await client.services.ampService?.getServerUpdate(
      instanceId
    );

    let serverAttempts = 0;
    while (serverUpdate?.Status.State !== AppState.Ready) {
      console.log("Waiting for server to start...");
      await new Promise((resolve) => setTimeout(resolve, 8000));
      serverUpdate = await client.services.ampService?.getServerUpdate(
        instanceId
      );
      serverAttempts++;
    }

    await client.services.channelServerService?.updateChannelEmbeds(
      client.channels.cache,
      client.services.ampService!
    );
  },
};
