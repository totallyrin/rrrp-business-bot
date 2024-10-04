const { Businesses, Employees } = require("./db");
const { Op } = require("sequelize");
const { Roles } = require("../config");

function hasPerms(user) {
  const roleIds = Object.values(Roles);
  return user.roles.cache.some((role) => roleIds.includes(role.id));
}

const autocompletes = {
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
  businessesAdminOnly: async (interaction) => {
    const focusedValue = interaction.options.getFocused();

    try {
      // If the user is not an admin or mod, return no results
      if (!hasPerms(interaction.member)) {
        return interaction.respond([]);
      }

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
  businessesRestricted: async (interaction) => {
    const focusedValue = interaction.options.getFocused();

    try {
      // Fetch all business names from db
      const businesses = await Businesses.findAll({
        attributes: ["name", "id"],
        where: {
          name: {
            [Op.like]: `${focusedValue}%`, // Filter by the user's input
          },
          ...(hasPerms(interaction.member)
            ? {}
            : { owner: interaction.user.id }),
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
  businessesEmployees: async (interaction) => {
    const focusedValue = interaction.options.getFocused();

    try {
      // Fetch all business names from db
      const businesses = await Businesses.findAll({
        attributes: ["name", "id"],
        where: {
          name: {
            [Op.like]: `${focusedValue}%`, // Filter by the user's input
          },
          ...(hasPerms(interaction.member)
            ? {}
            : {
                [Op.or]: [
                  { owner: interaction.user.id }, // The user is the owner
                  {
                    "$employees.userid$": interaction.user.id, // The user is an employee
                  },
                ],
              }),
        },
        include: [
          {
            model: Employees,
            attributes: [], // No need to fetch employee fields, just use the association
            required: false, // Include businesses even if they have no employees (if the user is the owner)
          },
        ],
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

module.exports = {
  autocompletes,
  hasPerms,
};
