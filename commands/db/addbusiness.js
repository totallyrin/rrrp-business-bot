const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses } = require("../../utils/db");
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

    try {
      await Businesses.create({
        name: name,
        type: type,
        owner: owner ? owner.id : undefined,
      });

      const embed = new EmbedBuilder()
        .setColor(0x4f9d69)
        .setTitle("Business Added")
        .setDescription(
          `**${name}** has been created.${owner ? `\nThis business is owned by **${owner.username}**.` : ""}`,
        );
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        const embed = new EmbedBuilder()
          .setColor(0xd84654)
          .setTitle("Business Already Exists")
          .setDescription(`**${name}** already exists.`);
        return interaction.reply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setColor(0xd84654)
        .setTitle("An Error Occurred")
        .setDescription("Something went wrong with adding a business.");
      return interaction.reply({ embeds: [embed] });
    }
  },
};
