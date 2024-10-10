const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { Businesses, Employees } = require("../../utils/db");
const { autocompletes } = require("../../utils/autocompletes");
const { Colours } = require("../../utils/colours");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("employees")
    .setDescription("View a business's employees")
    .addStringOption((option) =>
      option
        .setName("business")
        .setDescription("The name of the business")
        .setRequired(true)
        .setAutocomplete(true),
    ),
  async execute(interaction) {
    const business = interaction.options.getString("business");

    const businessData = await Businesses.findByPk(business, {
      attributes: ["name", "owner"],
    });

    if (!businessData) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("An Error Occurred")
        .setDescription(`Could not find a business named **${business}**.`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const { name: businessName, owner } = businessData.dataValues;

    const employees = await Employees.findAll({
      where: {
        business_id: business,
      },
    });

    if (!employees.length) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("No Employees Found")
        .setDescription(`No employees found for **${businessName}**.`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Pagination variables
    const itemsPerPage = 5;
    let currentPage = 0;

    const createEmbed = (page) => {
      const startIndex = page * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, employees.length);
      const currentEmployees = employees.slice(startIndex, endIndex);

      const description =
        currentEmployees
          .map((employee) => {
            return `- <@${employee.dataValues.userid}>`;
          })
          .join("\n") || "No employees found on this page.";

      return new EmbedBuilder()
        .setColor(Colours.neutral_light)
        .setTitle(`Employees - Page ${page + 1}`)
        .setDescription(
          `### ${businessName} ###\n**Owner:** ${owner ? `<@${owner}>` : "No owner"}${
            currentEmployees.length
              ? `\n${description}`
              : "\nNo employees found."
          }`,
        );
    };

    const createButtons = () => {
      const row = new ActionRowBuilder();
      const previousButton = new ButtonBuilder()
        .setCustomId("previous")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0);

      const nextButton = new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(
          currentPage >= Math.ceil(employees.length / itemsPerPage) - 1,
        );

      row.addComponents(previousButton, nextButton);
      return row;
    };

    const embed = createEmbed(currentPage);
    const row = createButtons();

    const message = await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    const collector = message.createMessageComponentCollector({
      time: 60000,
    }); // 60 seconds

    collector.on("collect", async (i) => {
      if (i.customId === "next") {
        currentPage++;
      } else if (i.customId === "previous") {
        currentPage--;
      }

      const newEmbed = createEmbed(currentPage);
      const newRow = createButtons();

      await i.update({ embeds: [newEmbed], components: [newRow] });
    });

    collector.on("end", async () => {
      const finalRow = createButtons();
      finalRow.components.forEach((button) => button.setDisabled(true));
      await message.edit({ components: [finalRow] });
    });
  },
  autocomplete: autocompletes.businesses,
};
