import { refresh } from "../buttons/refresh";
import { start } from "../buttons/start";
import { RawMessageButtonInteractionData } from "discord.js/typings/rawDataTypes.js";
import { MessageComponentInteraction } from "discord.js";
import { Bot } from "../types/bot";

export const Buttons: Button[] = [start, refresh];

export interface Button extends RawMessageButtonInteractionData {
  run: (client: Bot, interaction: MessageComponentInteraction) => void;
}
