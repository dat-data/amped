import {
  CommandInteraction,
  Client,
  Interaction,
  AutocompleteInteraction,
  MessageComponentInteraction,
} from "discord.js";
import { ApplicationCommands } from "../commands/commands";
import { Bot } from "../types/bot";
import { Buttons } from "../buttons/buttons";

export default (client: Bot): void => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isCommand() || interaction.isUserContextMenuCommand()) {
      await handleSlashCommand(client, interaction);
    } else if (interaction.isAutocomplete()) {
      await handleAutoCompleteInteraction(client, interaction);
    } else if (interaction.isButton()) {
      await handleButtonInteraction(client, interaction);
    }
  });
};

const handleSlashCommand = async (
  client: Bot,
  interaction: CommandInteraction
): Promise<void> => {
  const slashCommand = ApplicationCommands.find(
    (c) => c.name === interaction.commandName
  );
  if (!slashCommand) {
    interaction.reply({
      ephemeral: true,
      content: "Whoa, what were you trying for?",
    });
    return;
  }

  await interaction.deferReply({ ephemeral: slashCommand.ephemeral });

  slashCommand.run(client, interaction);
};

const handleAutoCompleteInteraction = async (
  client: Bot,
  interaction: AutocompleteInteraction
): Promise<void> => {
  const acCommand = ApplicationCommands.find(
    (c) => c.name === interaction.commandName
  );
  if (!acCommand) {
    process.stdout.write(
      `No matching AutoComplete command for ${interaction.commandName}`
    );
    return;
  }

  if (acCommand.autocomplete) await acCommand.autocomplete(client, interaction);
};

const handleButtonInteraction = async (
  client: Bot,
  interaction: MessageComponentInteraction
): Promise<void> => {
  const interactionId = interaction.customId.split("_")[0];
  const buttonInteraction = Buttons.find((b) => b.custom_id === interactionId);
  if (!buttonInteraction) {
    interaction.reply({
      ephemeral: true,
      content: "Whoa, what were you trying for?",
    });
    return;
  }

  buttonInteraction.run(client, interaction);
};
