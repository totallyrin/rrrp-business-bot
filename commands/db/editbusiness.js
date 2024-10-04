const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses } = require("../../utils/db");
const { Sequelize, Op } = require("sequelize");
const { jobList } = require("../../config").Config;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("editbusiness")
    .setDescription("Update an existing business")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("rename")
        .setDescription("Update the name of the business")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The current name of the business")
            .setRequired(true)
            .setAutocomplete(true),
        )
        .addStringOption((option) =>
          option
            .setName("newname")
            .setDescription("The new name of the business")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("type")
        .setDescription("Update the type of the business")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of the business")
            .setRequired(true)
            .setAutocomplete(true),
        )
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("The new type of business")
            .setRequired(true)
            .addChoices(
              ...jobList.map((job) => ({ name: job.name, value: job.value })),
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("owner")
        .setDescription("Update the owner of the business")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of the business")
            .setRequired(true)
            .setAutocomplete(true),
        )
        .addUserOption((option) =>
          option
            .setName("newowner")
            .setDescription("The new owner's Discord username")
            .setRequired(true),
        ),
    ),
  async execute(interaction) {
    const name = interaction.options.getString("name");
    const newname = interaction.options.getString("newname");
    const type = interaction.options.getString("type");
    const owner = interaction.options.getSubcommand("owner");
    const newowner = interaction.options.getUser("newowner");

    let data = {};
    if (newname) data = { name: newname };
    if (type) data = { type: type };
    if (owner) data = { owner: newowner.id || undefined };

    const affectedRows = await Businesses.update(data, {
      where: { name: name },
    });

    if (affectedRows > 0) {
      const embed = new EmbedBuilder()
        .setColor(0x4f9d69)
        .setTitle("Business Updated")
        .setDescription(
          `**${newname || name}** has been updated.\n\nChanges:
          ${newname ? `**${name}** has been renamed to **${newname}**\n` : ""}${type ? `Type was changed to **${type}**\n` : ""}${owner ? `Ownership transferred to **${owner.username}**\n` : ""}`,
        );
      return interaction.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(0xd84654)
      .setTitle("An Error Occurred")
      .setDescription(`Could not find a business named **${name}**.`);
    return interaction.reply({ embeds: [embed] });
  },
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();

    try {
      // Fetch all business names from db
      const businesses = await Businesses.findAll({
        attributes: ["name"],
        where: {
          name: {
            [Op.like]: `${focusedValue}%`, // Filter by the user's input
          },
        },
      });

      const choices = businesses.map((business) => ({
        name: business.name,
        value: business.name,
      }));

      await interaction.respond(choices.slice(0, 25));
    } catch (error) {
      console.error("Error fetching businesses for autocomplete:", error);
      await interaction.respond([]);
    }
  },
};
