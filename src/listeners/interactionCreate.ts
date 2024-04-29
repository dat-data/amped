import {
  CommandInteraction,
  Client,
  Interaction,
  AutocompleteInteraction,
} from "discord.js";
import { ApplicationCommands } from "../commands/commands";
import { Bot } from "src/types/bot";

export default (client: Bot): void => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isCommand() || interaction.isUserContextMenuCommand()) {
      await handleSlashCommand(client, interaction);
    } else if (interaction.isAutocomplete()) {
      await handleAutoCompleteInteraction(client, interaction);
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
