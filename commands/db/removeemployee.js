const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses, Employees } = require("../../utils/db");
const { autocompletes, hasPerms } = require("../../utils/autocompletes");
const { Colours } = require("../../utils/colours");
const { Channels } = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removeemployee")
    .setDescription("Remove an employee from a business")
    .addStringOption((option) =>
      option
        .setName("business")
        .setDescription("The name of the business")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addUserOption((option) =>
      option
        .setName("employee")
        .setDescription("The employee's Discord username")
        .setRequired(true),
    ),
  async execute(interaction) {
    const business = interaction.options.getString("business");
    const employee = interaction.options.getUser("employee");

    if (isNaN(business)) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("An Error Occurred")
        .setDescription(`Could not find your business named **${business}**.`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const { name: businessName, owner } = (
      await Businesses.findByPk(business, {
        attributes: ["name", "owner"],
      })
    ).dataValues;

    if (owner !== interaction.member.id && !hasPerms(interaction.member)) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("Access Denied")
        .setDescription("You do not have permission to use this command.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {
      const rowCount = await Employees.destroy({
        where: {
          business_id: business,
          userid: employee.id,
        },
      });

      if (!rowCount) {
        const embed = new EmbedBuilder()
          .setColor(Colours.error)
          .setTitle("Employee Does Not Exist")
          .setDescription(
            `<@${employee.id}> is not a member of **${businessName}**.`,
          );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(Colours.success)
        .setTitle("Employee Removed")
        .setDescription(
          `<@${employee.id}> has been removed from **${businessName}**.`,
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("An Error Occurred")
        .setDescription("Something went wrong with removing an employee.");
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
      .setColor(Colours.error)
      .setTitle("Employee Removed")
      .setDescription(
        `<@${interaction.member.id}> removed <@${employee.id}> from **${businessName}**.`,
      );
    return channel.send({ embeds: [embed] });
  },
  autocomplete: autocompletes.businessesRestricted,
};
