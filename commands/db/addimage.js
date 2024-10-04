const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses } = require("../../utils/db");
const { autocompletes } = require("../../utils/autocompletes");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addimage")
    .setDescription("Upload an image to a business")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("open")
        .setDescription("Update open sign")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The current name of the business")
            .setRequired(true)
            .setAutocomplete(true),
        )
        .addAttachmentOption((option) =>
          option
            .setName("image")
            .setDescription("The image to upload")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("closed")
        .setDescription("Update the closed sign")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of the business")
            .setRequired(true)
            .setAutocomplete(true),
        )
        .addAttachmentOption((option) =>
          option
            .setName("image")
            .setDescription("The image to upload")
            .setRequired(true),
        ),
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const name = interaction.options.getString("name");
    const image = interaction.options.getAttachment("image").attachment;

    console.log(image);

    if (isNaN(name)) {
      const embed = new EmbedBuilder()
        .setColor(0xd84654)
        .setTitle("An Error Occurred")
        .setDescription(`You do not own **${name}**.`);
      return interaction.reply({ embeds: [embed] });
    }

    let data = {};
    if (subcommand === "open") data = { open_image: image };
    else if (subcommand === "closed") data = { closed_image: image };

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
        .setColor(0x4f9d69)
        .setTitle("Business Updated")
        .setDescription(
          `**${businessName}** has been updated.\n- New ${subcommand} image:`,
        )
        .setImage(image);
      return interaction.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(0xd84654)
      .setTitle("An Error Occurred")
      .setDescription(`Could not find a business named **${businessName}**.`);
    return interaction.reply({ embeds: [embed] });
  },
  autocomplete: autocompletes.businessesRestricted,
};
