import { Bot } from "./types/bot";
import { GatewayIntentBits } from "discord.js";
import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";
import { AmpService } from "./services/amp.service";
import dotenv from "dotenv";
import { ChannelServerService } from "./services/channel.server.service";

dotenv.config();

// *Client link
// https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot%20applications.commands

// Client
const client = new Bot({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Listeners
client.removeAllListeners();
ready(client);
interactionCreate(client);
client.login(process.env.TOKEN);

// Services
client.services = {
  ampService: new AmpService(),
  channelServerService: new ChannelServerService(),
};

// Initial instance update
setTimeout(async () => {
  await client.services.channelServerService?.updateChannelEmbeds(
    client.channels.cache,
    client.services.ampService!
  );
}, 5000);
