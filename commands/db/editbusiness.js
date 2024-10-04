const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses } = require("../../utils/db");
const { autocompletes } = require("../../utils/autocompletes");
const { Colours } = require("../../utils/colours");
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
    else if (type) data = { type: type };
    else if (owner) data = { owner: newowner ? newowner.id : undefined };

    if (isNaN(name)) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("An Error Occurred")
        .setDescription(`You do not own **${name}**.`);
      return interaction.reply({ embeds: [embed] });
    }

    const businessName = (
      await Businesses.findByPk(name, {
        attributes: ["name"],
      })
    ).dataValues.name;

    const affectedRows = await Businesses.update(data, {
      where: { id: name },
    });

    if (affectedRows > 0) {
      const embed = new EmbedBuilder()
        .setColor(Colours.success)
        .setTitle("Business Updated")
        .setDescription(
          `**${newname || businessName}** has been updated.\n\nChanges:
          ${newname ? `- **${businessName}** has been renamed to **${newname}**\n` : ""}${type ? `- Type was changed to **${type}**\n` : ""}${newowner ? `- Ownership transferred to **${newowner.username}**\n` : ""}`,
        );
      return interaction.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(Colours.error)
      .setTitle("An Error Occurred")
      .setDescription(`Could not find a business named **${businessName}**.`);
    return interaction.reply({ embeds: [embed] });
  },
  autocomplete: autocompletes.businessesRestricted,
};
