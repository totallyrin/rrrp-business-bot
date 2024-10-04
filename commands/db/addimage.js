const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses } = require("../../utils/db");
const { autocompletes } = require("../../utils/autocompletes");
const { Colours } = require("../../utils/colours");
const { Channels } = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addimage")
    .setDescription("Upload an image to a business")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("open")
        .setDescription("Update open image")
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
        .setDescription("Update closed image")
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

    if (isNaN(name)) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("An Error Occurred")
        .setDescription(`You do not own **${name}**.`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
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
        .setColor(Colours.success)
        .setTitle("Business Updated")
        .setDescription(
          `**${businessName}** has been updated.\n- New **${subcommand}** image:`,
        )
        .setImage(image);
      await interaction.reply({ embeds: [embed], ephemeral: true });

      let channel = interaction.client.channels.cache.get(Channels.logs);

      if (!channel) {
        try {
          channel = await interaction.client.channels.fetch(Channels.logs);
        } catch (error) {
          return console.error(`Error fetching channel: ${error}`);
        }
      }

      const log = new EmbedBuilder()
        .setColor(Colours.success)
        .setTitle("Image Added")
        .setDescription(
          `<@${interaction.member.id}> added an image to **${businessName}**.
          - Type: **${subcommand}_image**`,
        )
        .setImage(image);
      return channel.send({ embeds: [log] });
    }

    const embed = new EmbedBuilder()
      .setColor(Colours.error)
      .setTitle("An Error Occurred")
      .setDescription(`Could not find a business named **${businessName}**.`);
    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
  autocomplete: autocompletes.businessesRestricted,
};
