import { Bot } from "./types/bot.js";
import { GatewayIntentBits } from "discord.js";
import ready from "./listeners/ready.js";
import interactionCreate from "./listeners/interactionCreate.js";
import { AmpService } from "./services/amp.service.js";
import dotenv from "dotenv";

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
};

//TODO - Setup timed events (turn off server)
