const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses } = require("../../utils/db");
const { autocompletes } = require("../../utils/autocompletes");
const { Colours } = require("../../utils/colours");

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
        .setColor(Colours.error)
        .setTitle("An Error Occurred")
        .setDescription(`You are not an employee of **${business}**.`);
      return interaction.reply({ embeds: [embed] });
    }

    const { name: businessName, open_image: image } = (
      await Businesses.findByPk(business, {
        attributes: ["name", "open_image"],
      })
    ).dataValues;

    const affectedRows = await Businesses.update(
      { last_opened: new Date() },
      { where: { id: business } },
    );

    if (affectedRows > 0) {
      const embed = new EmbedBuilder()
        .setColor(Colours.success_light)
        .setTitle("Open for Business")
        .setDescription(`**${businessName}** is now open!`)
        .setImage(image);
      return interaction.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(Colours.error)
      .setTitle("An Error Occurred")
      .setDescription(`Could not find a business named **${businessName}**.`);
    return interaction.reply({ embeds: [embed] });
  },
  autocomplete: autocompletes.businessesEmployees,
};
