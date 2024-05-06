import { Client } from "discord.js";
import { AmpService } from "../services/amp.service";
import { ChannelServerService } from "../services/channel.server.service";

interface services {
  ampService: AmpService | undefined;
  channelServerService: ChannelServerService | undefined;
}

export class Bot extends Client {
  services: services = {} as services;
}
