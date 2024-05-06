import {
  ActionRowBuilder,
  ButtonBuilder,
  GuildMember,
  MessageComponentInteraction,
  TextChannel,
} from "discord.js";
import { Bot } from "../types/bot";
import { Button } from "../buttons/buttons";

export const refresh: Button = {
  custom_id: "refresh",
  component_type: 2,
  run: async (client: Bot, interaction: MessageComponentInteraction) => {
    const member = interaction.member as GuildMember;
    const channel = interaction.channel as TextChannel;

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

    await client.services.channelServerService?.updateChannelEmbeds(
      client.channels.cache,
      client.services.ampService!
    );

    console.log(
      `Bot button refresh: used by ${member.displayName} in channel ${channel.name}`
    );
  },
};
