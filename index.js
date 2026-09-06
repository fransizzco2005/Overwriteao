require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenAI } = require('@google/genai');

// Check required variables
if (!process.env.DISCORD_TOKEN || !process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: Missing DISCORD_TOKEN or GEMINI_API_KEY in .env file!");
  process.exit(1);
}

// Allowed Channel IDs (Add as many channel IDs as you want to this list)
const ALLOWED_CHANNELS = [
  '1546193711942336612'
];

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}! AI Assistant is listening on allowed channels...`);
});

// Auto-respond to messages in allowed channels
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Only respond if the message is in an allowed channel
  if (!ALLOWED_CHANNELS.includes(message.channel.id)) return;

  await message.channel.sendTyping();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message.content,
    });

    await message.reply(response.text);
  } catch (error) {
    console.error('Error generating AI response:', error);
    await message.reply('Sorry, I ran into an error processing that.');
  }
});

client.login(process.env.DISCORD_TOKEN);
