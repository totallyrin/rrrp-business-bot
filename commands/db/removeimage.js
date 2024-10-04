const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses } = require("../../utils/db");
const { autocompletes } = require("../../utils/autocompletes");
const { Colours } = require("../../utils/colours");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removeimage")
    .setDescription("Remove an image from a business")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("open")
        .setDescription("Remove open image")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The current name of the business")
            .setRequired(true)
            .setAutocomplete(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("closed")
        .setDescription("Remove closed image")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of the business")
            .setRequired(true)
            .setAutocomplete(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("both")
        .setDescription("Remove both open and closed images")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of the business")
            .setRequired(true)
            .setAutocomplete(true),
        ),
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const name = interaction.options.getString("name");

    if (isNaN(name)) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("An Error Occurred")
        .setDescription(`You do not own **${name}**.`);
      return interaction.reply({ embeds: [embed] });
    }

    let data = {};
    if (subcommand === "open") data = { open_image: null };
    else if (subcommand === "closed") data = { closed_image: null };
    if (subcommand === "both") data = { open_image: null, closed_image: null };

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
          `**${businessName}** has been updated.\n- Removed ${subcommand} image${subcommand === "both" ? "s" : ""}.`,
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
