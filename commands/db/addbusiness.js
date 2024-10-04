const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses } = require("../../utils/db");
const { Colours } = require("../../utils/colours");
const { Channels } = require("../../config");
const { hasPerms } = require("../../utils/autocompletes");
const { jobList } = require("../../config").Config;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addbusiness")
    .setDescription("Add a new business")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the business")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type of business")
        .setRequired(true)
        .addChoices(
          ...jobList.map((job) => ({ name: job.name, value: job.value })),
        ),
    )
    .addUserOption((option) =>
      option
        .setName("owner")
        .setDescription("The owner's Discord username")
        .setRequired(false),
    ),
  async execute(interaction) {
    const name = interaction.options.getString("name");
    const type = interaction.options.getString("type");
    const owner = interaction.options.getUser("owner");

    if (!hasPerms(interaction.member)) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("Access Denied")
        .setDescription("You do not have permission to use this command.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {
      await Businesses.create({
        name: name,
        type: type,
        owner: owner ? owner.id : undefined,
      });

      const embed = new EmbedBuilder()
        .setColor(Colours.success)
        .setTitle("Business Added")
        .setDescription(
          `**${name}** has been created.${owner ? `\nThis business is owned by <@${owner.id}>.` : ""}`,
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        const embed = new EmbedBuilder()
          .setColor(Colours.error)
          .setTitle("Business Already Exists")
          .setDescription(`**${name}** already exists.`);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("An Error Occurred")
        .setDescription("Something went wrong with adding a business.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    let channel = interaction.client.channels.cache.get(Channels.logs);

    if (!channel) {
      try {
        channel = await interaction.client.channels.fetch(Channels.logs);
      } catch (error) {
        return console.error(`Error fetching channel: ${error}`);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(Colours.success)
      .setTitle("Business Created")
      .setDescription(
        `<@${interaction.member.id}> added **${name}** to the database.
        - Type: **${type}**${owner ? `\n- Owner: <@${owner.id}>` : ""}`,
      );
    return channel.send({ embeds: [embed] });
  },
};
