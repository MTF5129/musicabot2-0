const { Client, GatewayIntentBits } = require("discord.js");
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YtDlpPlugin } = require("@distube/yt-dlp");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const distube = new DisTube(client, {
  leaveOnEmpty: true,
  leaveOnFinish: true,
  leaveOnStop: true,
  plugins: [
    new SpotifyPlugin(),
    new SoundCloudPlugin(),
    new YtDlpPlugin()
  ],
  emitNewSongOnly: true,
  nsfw: true,
  directLink: true,
  youtubeDL: false,
  updateYouTubeDL: false,
  emitAddListWhenCreatingQueue: false,
  emitAddSongWhenCreatingQueue: false,
  ytdlOptions: { highWaterMark: 1 << 25 }
});

client.once("ready", () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;
  const prefix = process.env.PREFIX || "!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "play") {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("🎧 Você precisa estar em um canal de voz!");
    if (!args[0]) return message.reply("🔗 Forneça um link ou nome da música.");
    distube.play(voiceChannel, args.join(" "), { textChannel: message.channel, member: message.member });
  }

  if (command === "stop") {
    distube.stop(message);
    message.channel.send("⏹ Música parada.");
  }

  if (command === "skip") {
    distube.skip(message);
    message.channel.send("⏭ Pulando música...");
  }
});

client.login(process.env.DISCORD_TOKEN);
