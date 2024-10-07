const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses, Employees } = require("../../utils/db");
const { autocompletes, hasPerms } = require("../../utils/autocompletes");
const { Colours } = require("../../utils/colours");
const { Channels } = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("close")
    .setDescription("Close your business")
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
        .setDescription(`Could not find your business named **${business}**.`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const {
      name: businessName,
      owner,
      closed_image: image,
    } = (
      await Businesses.findByPk(business, {
        attributes: ["name", "owner", "closed_image"],
      })
    ).dataValues;

    const employees = (
      await Employees.findAll({
        where: {
          business_id: business,
        },
      })
    ).map((employee) => employee.dataValues.userid);

    if (
      owner !== interaction.member.id &&
      !hasPerms(interaction.member) &&
      !employees.includes(interaction.user.id)
    ) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("Access Denied")
        .setDescription("You do not have permission to use this command.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    let channel = interaction.client.channels.cache.get(Channels.marketplace);

    if (!channel) {
      try {
        channel = await interaction.client.channels.fetch(Channels.marketplace);
      } catch (error) {
        return console.error(`Error fetching channel: ${error}`);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(Colours.error_light)
      .setTitle("Closed for Business")
      .setDescription(`**${businessName}** is now closed.`)
      .setImage(image);
    const message = await channel.send({ embeds: [embed] });

    const embed2 = new EmbedBuilder().setColor(Colours.success).setDescription(
      `**${businessName}** is now closed.
      - ${message.url}`,
    );
    return interaction.reply({ embeds: [embed2], ephemeral: true });
  },
  autocomplete: autocompletes.businessesEmployees,
};
