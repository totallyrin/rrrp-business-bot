const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses } = require("../../utils/db");
const { autocompletes } = require("../../utils/autocompletes");
const { Colours } = require("../../utils/colours");
const { Channels } = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Issue an inactivity warning to a business owner")
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
        .setDescription(`Could not find a business named **${businessName}**.`);
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

    const warning = new EmbedBuilder()
      .setColor(Colours.warning_light)
      .setTitle("Inactivity Warning")
      .setDescription(
        `## ${businessName} ##
        - Your business has been **inactive** since **${dt.toLocaleDateString(
          "en-US",
          {
            // year: "numeric",
            month: "long", // full month name
            day: "numeric", // day of the month
          },
        )}**.
        - You have **two days** to open your business through <#${Channels.marketplace}>.
        - Failure to do so will result in the **seizure of your business** and you will no longer have access to business specific crafting or storage.
        - **This is the only warning you will receive for this matter.**`,
      );

    await channel.send({ content: `<@${owner}>`, embeds: [warning] });

    const embed = new EmbedBuilder()
      .setColor(Colours.success)
      .setTitle("Warning Issued")
      .setDescription(`Issued an inactivity warning for **${businessName}**.`);
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
      .setTitle("Warning Issued")
      .setDescription(
        `<@${interaction.member.id}> issued an inactivity warning for **${businessName}**.
        - Type: **${type}**${owner ? `\n- Owner: <@${owner}>` : ""}`,
      );
    return channel.send({ embeds: [log] });
  },
  autocomplete: autocompletes.businessesEmployees,
};
