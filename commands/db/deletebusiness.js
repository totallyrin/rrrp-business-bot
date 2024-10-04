const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses } = require("../../utils/db");
const { autocompletes } = require("../../utils/autocompletes");
const { Colours } = require("../../utils/colours");
const { Channels } = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deletebusiness")
    .setDescription("Delete a business")
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
        .setDescription(`You do not have permission to use this command.`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const {
      name: businessName,
      type,
      owner,
    } = (
      await Businesses.findByPk(business, {
        attributes: ["name", "type", "owner"],
      })
    ).dataValues;

    const affectedRows = await Businesses.destroy({ where: { id: business } });

    if (affectedRows) {
      const embed = new EmbedBuilder()
        .setColor(Colours.success)
        .setTitle("Business Deleted")
        .setDescription(`**${businessName}** was successfully deleted.`);
      await interaction.reply({ embeds: [embed], ephemeral: true });

      let channel = interaction.client.channels.cache.get(Channels.logs);

      if (!channel) {
        try {
          channel = await interaction.client.channels.fetch(Channels.logs);
        } catch (error) {
          return console.error(`Error fetching channel: ${error}`);
        }
      }

      const log = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("Business Deleted")
        .setDescription(
          `<@${interaction.member.id}> deleted **${businessName}** from the database.
        - Type: **${type}**${owner ? `\n- Owner: <@${owner}>` : ""}`,
        );
      return channel.send({ embeds: [log] });
    }

    const embed = new EmbedBuilder()
      .setColor(Colours.error)
      .setTitle("An Error Occurred")
      .setDescription(`Could not find a business named **${businessName}**.`);
    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
  autocomplete: autocompletes.businessesAdminOnly,
};
