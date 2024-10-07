const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses } = require("../../utils/db");
const { autocompletes, hasPerms } = require("../../utils/autocompletes");
const { Colours } = require("../../utils/colours");
const { Channels } = require("../../config");
const { Storage } = require("@google-cloud/storage");
const { get } = require("axios");

const storage = new Storage();

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
    await interaction.deferReply({ ephemeral: true }); // Acknowledge the interaction

    const subcommand = interaction.options.getSubcommand();
    const name = interaction.options.getString("name");
    const image = interaction.options.getAttachment("image");

    if (isNaN(name)) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("An Error Occurred")
        .setDescription(`Could not find your business named **${name}**.`);
      return interaction.editReply({ embeds: [embed], ephemeral: true });
    }

    const { name: businessName, owner } = (
      await Businesses.findByPk(name, {
        attributes: ["name", "owner"],
      })
    ).dataValues;

    if (owner !== interaction.member.id && !hasPerms(interaction.member)) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("Access Denied")
        .setDescription("You do not have permission to use this command.");
      return interaction.editReply({ embeds: [embed], ephemeral: true });
    }

    let imageUrl = null;
    try {
      const imageResponse = await get(image.url, {
        responseType: "arraybuffer",
      });
      const imageBuffer = Buffer.from(imageResponse.data, "binary");

      const fileName = `${Date.now()}_${image.name}`;
      // upload image to Google Cloud Storage
      await storage
        .bucket(process.env.BUCKET_NAME)
        .file(fileName)
        .save(imageBuffer, {
          metadata: { contentType: image.contentType },
        });

      // Create a public URL for the uploaded image
      imageUrl = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${fileName}`;
    } catch (error) {
      return console.error(error);
    }

    let data = {};
    if (subcommand === "open") data = { open_image: imageUrl };
    else if (subcommand === "closed") data = { closed_image: imageUrl };

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
        .setImage(imageUrl);
      await interaction.editReply({ embeds: [embed], ephemeral: true });

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
          `<@${interaction.member.id}> added an image to **${businessName}**.\n- Type: **${subcommand}_image**`,
        )
        .setImage(imageUrl);
      return channel.send({ embeds: [log] });
    }

    const embed = new EmbedBuilder()
      .setColor(Colours.error)
      .setTitle("An Error Occurred")
      .setDescription(`Could not find a business named **${businessName}**.`);
    return interaction.editReply({ embeds: [embed], ephemeral: true });
  },
  autocomplete: autocompletes.businessesRestricted,
};
