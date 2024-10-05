const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses, Employees } = require("../../utils/db");
const { autocompletes } = require("../../utils/autocompletes");
const { Colours } = require("../../utils/colours");
const { Channels } = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("seize")
    .setDescription("Seize a business (remove owner and employees)")
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
        .setTitle("Access Denied")
        .setDescription(`You do not have permission to use this command.`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const {
      name: businessName,
      type,
      owner,
      last_opened: dt,
    } = (
      await Businesses.findByPk(business, {
        attributes: ["name", "type", "owner", "last_opened"],
      })
    ).dataValues;

    let channel = interaction.client.channels.cache.get(Channels.closures);

    if (!channel) {
      try {
        channel = await interaction.client.channels.fetch(Channels.closures);
      } catch (error) {
        console.error(`Error fetching channel: ${error}`);
        const embed = new EmbedBuilder()
          .setColor(Colours.error)
          .setTitle("An Error Occurred")
          .setDescription(
            `Could not find channel <#${Channels.closures}> with ID **${Channels.closures}**.`,
          );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }

    try {
      const affectedRows = await Businesses.update(
        { owner: null, warned: false },
        { where: { id: business } },
      );
      await Employees.destroy({ where: { business_id: business } });

      if (!affectedRows) {
        const embed = new EmbedBuilder()
          .setColor(Colours.error)
          .setTitle("An Error Occurred")
          .setDescription(
            `Could not find a business named **${businessName}**.`,
          );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const warning = new EmbedBuilder()
        .setColor(Colours.warning_light)
        .setTitle("Business Seized")
        .setDescription(
          `## ${businessName} ##
        - This business has been **inactive** since **${dt.toLocaleDateString(
          "en-US",
          {
            // year: "numeric",
            month: "long", // full month name
            day: "numeric", // day of the month
          },
        )}**.
        - As a result, **it has been seized**, per <#${Channels.rules}>.`,
        );

      await channel.send({ content: `<@${owner}>`, embeds: [warning] });

      const embed = new EmbedBuilder()
        .setColor(Colours.success)
        .setTitle("Business Seized")
        .setDescription(`Seized **${businessName}**.`);
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
        .setTitle("Business Seized")
        .setDescription(
          `<@${interaction.member.id}> seized **${businessName}**.
        - Type: **${type}**${owner ? `\n- Owner: <@${owner}>` : ""}`,
        );
      return channel.send({ embeds: [log] });
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("An Error Occurred")
        .setDescription("Something went wrong with seizing a business.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
  autocomplete: autocompletes.businessesAdminOnly,
};
