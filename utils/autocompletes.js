const { Businesses } = require("./db");
const { Op } = require("sequelize");

module.exports.autocompletes = {
  businesses: async (interaction) => {
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
