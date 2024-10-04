const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses } = require("../../utils/db");
const { autocompletes } = require("../../utils/autocompletes");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("open")
    .setDescription("Open your business")
    .addStringOption((option) =>
      option
        .setName("business")
        .setDescription("The name of the business")
        .setRequired(true)
        .setAutocomplete(true),
    ),
  async execute(interaction) {
    const business = interaction.options.getString("business");

    if (isNaN(business)) {
      const embed = new EmbedBuilder()
        .setColor(0xd84654)
        .setTitle("An Error Occurred")
        .setDescription(`You are not an employee of **${business}**.`);
      return interaction.reply({ embeds: [embed] });
    }

    const businessName = (
      await Businesses.findByPk(business, {
        attributes: ["name"],
      })
    ).dataValues.name;

    const affectedRows = await Businesses.update(
      { last_opened: new Date() },
      { where: { id: business } },
    );

    if (affectedRows > 0) {
      const embed = new EmbedBuilder()
        .setColor(0x4f9d69)
        .setTitle("Open for Business")
        .setDescription(`**${businessName}** is now open!`);
      return interaction.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(0xd84654)
      .setTitle("An Error Occurred")
      .setDescription(`Could not find a business named **${businessName}**.`);
    return interaction.reply({ embeds: [embed] });
  },
  autocomplete: autocompletes.businessesEmployees,
};
