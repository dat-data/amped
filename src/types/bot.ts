import { Client } from "discord.js";
import { AmpService } from "src/services/amp.service.js";

interface services {
  ampService: AmpService | undefined;
}

export class Bot extends Client {
  services: services = {} as services;
}
