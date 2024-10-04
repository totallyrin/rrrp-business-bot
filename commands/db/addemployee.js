const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses, Employees } = require("../../utils/db");
const { autocompletes } = require("../../utils/autocompletes");
const { Colours } = require("../../utils/colours");

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
        .setDescription(`You do not own **${business}**.`);
      return interaction.reply({ embeds: [embed] });
    }

    try {
      const businessName = (
        await Businesses.findByPk(business, {
          attributes: ["name"],
        })
      ).dataValues.name;

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
            `**${employee.username}** is already a member of **${businessName}**.`,
          );
        return interaction.reply({ embeds: [embed] });
      }

      await Employees.create({
        business_id: business,
        userid: employee.id,
      });

      const embed = new EmbedBuilder()
        .setColor(Colours.success)
        .setTitle("Employee Added")
        .setDescription(
          `**${employee.username}** has been added to **${businessName}**.`,
        );
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("An Error Occurred")
        .setDescription("Something went wrong with adding an employee.");
      return interaction.reply({ embeds: [embed] });
    }
  },
  autocomplete: autocompletes.businessesRestricted,
};
