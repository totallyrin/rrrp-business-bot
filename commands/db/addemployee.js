const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses, Employees } = require("../../utils/db");
const { autocompletes } = require("../../utils/autocompletes");

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
          .setColor(0xd84654)
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
        .setColor(0x4f9d69)
        .setTitle("Employee Added")
        .setDescription(
          `**${employee.username}** has been added to **${businessName}**.`,
        );
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor(0xd84654)
        .setTitle("An Error Occurred")
        .setDescription("Something went wrong with adding an employee.");
      return interaction.reply({ embeds: [embed] });
    }
  },
  autocomplete: autocompletes.businesses,
};
