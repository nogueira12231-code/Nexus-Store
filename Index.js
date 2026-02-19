const {
Client,
GatewayIntentBits,
ChannelType,
SlashCommandBuilder,
REST,
Routes,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
PermissionsBitField,
Events
} = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = '1474036068578754561';
const GUILD_ID = '1473810884198666240';

const client = new Client({
intents: [GatewayIntentBits.Guilds]
});

const filas = {};

const modos = [
"1v1 mob","2v2 mob","3v3 mob","4v4 mob",
"1v1 emu","2v2 emu","3v3 emu","4v4 emu",
"1v1 misto","2v2 misto","3v3 misto","4v4 misto"
];

// =====================
// REGISTRAR /orgfila
// =====================

const commands = [
new SlashCommandBuilder()
.setName('orgfila')
.setDescription('Organiza servidor FF com todas as filas')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
await rest.put(
Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
{ body: commands }
);
console.log("✅ Slash /orgfila registrado!");
})();

// =====================
// QUANDO USAR /orgfila
// =====================

client.on(Events.InteractionCreate, async interaction => {

if (!interaction.isChatInputCommand()) return;

if (interaction.commandName === 'orgfila') {

await interaction.reply("🔥 Organizando servidor de filas FF...");  

const guild = interaction.guild;  

const categoria = await guild.channels.create({  
  name: "🎮 FILAS FREE FIRE",  
  type: ChannelType.GuildCategory  
});  

for (let modo of modos) {  

  filas[modo] = [];  

  const canal = await guild.channels.create({  
    name: modo.replaceAll(" ", "-"),  
    type: ChannelType.GuildText,  
    parent: categoria.id  
  });  

  const row = new ActionRowBuilder().addComponents(  
    new ButtonBuilder()  
      .setCustomId(`fila_${modo}`)  
      .setLabel(`Entrar na fila ${modo}`)  
      .setStyle(ButtonStyle.Primary)  
  );  

  canal.send({  
    content: `🔥 **Fila ${modo.toUpperCase()}**

Clique no botão para entrar.`,
components: [row]
});
}
}

// =====================
// SISTEMA DE FILA
// =====================

if (interaction.isButton()) {

if (interaction.customId.startsWith("fila_")) {  

  const modo = interaction.customId.replace("fila_", "");  

  if (!filas[modo]) return;  

  if (filas[modo].includes(interaction.user.id)) {  
    return interaction.reply({ content: "Você já está na fila!", ephemeral: true });  
  }  

  filas[modo].push(interaction.user.id);  

  const tamanho = parseInt(modo.split("v")[0]);  
  const necessario = tamanho * 2;  

  await interaction.reply({  
    content: `✅ Você entrou na fila ${modo}

👥 ${filas[modo].length}/${necessario}`,
ephemeral: true
});

if (filas[modo].length >= necessario) {  

    const jogadores = filas[modo].splice(0, necessario);  

    const sala = await interaction.guild.channels.create({  
      name: `sala-${modo}-${Date.now()}`,  
      type: ChannelType.GuildText,  
      permissionOverwrites: [  
        {  
          id: interaction.guild.id,  
          deny: [PermissionsBitField.Flags.ViewChannel]  
        },  
        ...jogadores.map(id => ({  
          id: id,  
          allow: [PermissionsBitField.Flags.ViewChannel]  
        }))  
      ]  
    });  

    sala.send(`🔥 Sala criada para ${modo}

👥 Jogadores:
${jogadores.map(id => `<@${id}>`).join("\n")}

Boa partida! 🎮`);
}
}
}

});

client.login(TOKEN);
