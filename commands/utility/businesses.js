const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { Businesses } = require("../../utils/db");
const { Colours } = require("../../utils/colours");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("businesses")
    .setDescription("View all businesses"),
  async execute(interaction) {
    const businesses = await Businesses.findAll({
      attributes: ["name", "type", "owner"],
    });

    if (businesses.length) {
      const itemsPerPage = 5;
      let currentPage = 0;

      const createEmbed = (page) => {
        const startIndex = page * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, businesses.length);
        const currentBusinesses = businesses.slice(startIndex, endIndex);

        // Create a table-like string for the description
        const description =
          currentBusinesses
            .map((business) => {
              return `**${business.name}**\n- Type: **${business.type}**${business.owner ? `\n- Owner: <@${business.owner}>` : ""}`;
            })
            .join("\n") || "No businesses found on this page.";

        return new EmbedBuilder()
          .setColor(Colours.neutral_light)
          .setTitle("Businesses")
          .setDescription(
            currentBusinesses.length
              ? `## Page ${page + 1} ##\n${description}`
              : "No businesses found.",
          );
      };

      const createButtons = () => {
        const row = new ActionRowBuilder();
        const previousButton = new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0); // Disable if on the first page

        const nextButton = new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(
            currentPage >= Math.ceil(businesses.length / itemsPerPage) - 1,
          ); // Disable if on the last page

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
        // Disable buttons after the collector ends
        const finalRow = createButtons();
        finalRow.components.forEach((button) => button.setDisabled(true));
        await message.edit({ components: [finalRow] });
      });
    } else {
      const embed = new EmbedBuilder()
        .setColor(Colours.neutral_light)
        .setTitle("No Businesses Found")
        .setDescription(`It doesn't look like there are any businesses here.`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
