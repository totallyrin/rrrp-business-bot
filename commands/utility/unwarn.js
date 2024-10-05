const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses } = require("../../utils/db");
const { autocompletes, hasPerms } = require("../../utils/autocompletes");
const { Colours } = require("../../utils/colours");
const { Channels } = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unwarn")
    .setDescription("Remove an inactivity warning from a business")
    .addStringOption((option) =>
      option
        .setName("business")
        .setDescription("The name of the business")
        .setRequired(true)
        .setAutocomplete(true),
    ),
  async execute(interaction) {
    if (!hasPerms(interaction.member)) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("Access Denied")
        .setDescription("You do not have permission to use this command.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const business = interaction.options.getString("business");

    if (isNaN(business)) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("An Error Occurred")
        .setDescription(`Could not find a business named **${business}**.`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const businessName = (
      await Businesses.findByPk(business, {
        attributes: ["name"],
      })
    ).dataValues.name;

    let channel = interaction.client.channels.cache.get(Channels.warnings);

    if (!channel) {
      try {
        channel = await interaction.client.channels.fetch(Channels.warnings);
      } catch (error) {
        console.error(`Error fetching channel: ${error}`);
        const embed = new EmbedBuilder()
          .setColor(Colours.error)
          .setTitle("An Error Occurred")
          .setDescription(
            `Could not find channel <#${Channels.warnings}> with ID **${Channels.warnings}**.`,
          );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }

    try {
      const affectedRows = await Businesses.update(
        { warned: false },
        { where: { id: business } },
      );

      if (!affectedRows) {
        const embed = new EmbedBuilder()
          .setColor(Colours.error)
          .setTitle("An Error Occurred")
          .setDescription(
            `Could not find a business named **${businessName}**.`,
          );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(Colours.success)
        .setTitle("Warning Removed")
        .setDescription(
          `Removed an inactivity warning from **${businessName}**.`,
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });

      channel = interaction.client.channels.cache.get(Channels.logs);

      if (!channel) {
        try {
          channel = await interaction.client.channels.fetch(Channels.logs);
        } catch (error) {
          return console.error(`Error fetching channel: ${error}`);
        }
      }

      const log = new EmbedBuilder()
        .setColor(Colours.warning)
        .setTitle("Warning Removed")
        .setDescription(
          `<@${interaction.member.id}> removed an inactivity warning from **${businessName}**.`,
        );
      return channel.send({ embeds: [log] });
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("An Error Occurred")
        .setDescription("Something went wrong with removing a warning.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
  autocomplete: autocompletes.businessesAdminOnly,
};
