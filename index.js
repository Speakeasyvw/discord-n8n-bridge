const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const TARGET_CHANNEL_ID = process.env.CHANNEL_ID;

if (!DISCORD_TOKEN || !N8N_WEBHOOK_URL || !TARGET_CHANNEL_ID) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
}).listen(PORT);

client.once('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channelId !== TARGET_CHANNEL_ID) return;

  const payload = {
    channel_id: message.channelId,
    channel_name: message.channel?.name,
    author: message.author.username,
    author_id: message.author.id,
    content: message.content,
    created_at: message.createdAt.toISOString(),
  };

  console.log('📩 Mensaje detectado', payload);

  try {
    const r = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('➡️ Respuesta de n8n:', r.status);
  } catch (err) {
    console.error('❌ Error enviando a n8n', err);
  }
});

client.login(DISCORD_TOKEN);


