const {
  SlashCommandBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
} = require("discord.js");
const { Businesses, Employees } = require("../../utils/Businesses");
const { Op } = require("sequelize");
const { jobList } = require("../../config").Config;

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

    try {
      const businessName = (
        await Businesses.findByPk(business, {
          attributes: ["name"],
        })
      ).dataValues.name;

      const rowCount = await Employees.destroy({
        where: {
          business_id: business,
          userid: employee.id,
        },
      });

      if (!rowCount) {
        const embed = new EmbedBuilder()
          .setColor(0xd84654)
          .setTitle("Employee Does Not Exist")
          .setDescription(
            `**${employee.username}** is not a member of **${businessName}**.`,
          );
        return interaction.reply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setColor(0x4f9d69)
        .setTitle("Employee Removed")
        .setDescription(
          `**${employee.username}** has been removed from **${businessName}**.`,
        );
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor(0xd84654)
        .setTitle("An Error Occurred")
        .setDescription("Something went wrong with removing an employee.");
      return interaction.reply({ embeds: [embed] });
    }
  },
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();

    try {
      // Fetch all business names from db
      const businesses = await Businesses.findAll({
        attributes: ["name", "id"],
        where: {
          name: {
            [Op.like]: `${focusedValue}%`, // Filter by the user's input
          },
        },
      });

      const choices = businesses.map((business) => ({
        name: business.name,
        value: business.id.toString(),
      }));

      await interaction.respond(choices.slice(0, 25));
    } catch (error) {
      console.error("Error fetching businesses for autocomplete:", error);
      await interaction.respond([]);
    }
  },
};
