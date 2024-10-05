const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses, Employees } = require("../../utils/db");
const { autocompletes, hasPerms } = require("../../utils/autocompletes");
const { Colours } = require("../../utils/colours");
const { Channels } = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addemployee")
    .setDescription("Add an employee to a business")
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
    ).dataValues.name;

    if (owner !== interaction.member.id && !hasPerms(interaction.member)) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("Access Denied")
        .setDescription("You do not have permission to use this command.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {
      const employeeExists = await Employees.findOne({
        where: {
          business_id: business,
          userid: employee.id,
        },
      });

      if (employeeExists) {
        const embed = new EmbedBuilder()
          .setColor(Colours.error)
          .setTitle("Employee Already Exists")
          .setDescription(
            `<@${employee.id}> is already a member of **${businessName}**.`,
          );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      await Employees.create({
        business_id: business,
        userid: employee.id,
      });

      const embed = new EmbedBuilder()
        .setColor(Colours.success)
        .setTitle("Employee Added")
        .setDescription(
          `<@${employee.id}> has been added to **${businessName}**.`,
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("An Error Occurred")
        .setDescription("Something went wrong with adding an employee.");
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
      .setTitle("Employee Added")
      .setDescription(
        `<@${interaction.member.id}> added <@${employee.id}> to the **${businessName}**.`,
      );
    return channel.send({ embeds: [embed] });
  },
  autocomplete: autocompletes.businessesRestricted,
};
