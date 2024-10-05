const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Businesses } = require("../../utils/db");
const { autocompletes, hasPerms } = require("../../utils/autocompletes");
const { Colours } = require("../../utils/colours");
const { Channels } = require("../../config");

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
        .setDescription(`Could not find your business named **${name}**.`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    let data = {};
    if (subcommand === "open") data = { open_image: null };
    else if (subcommand === "closed") data = { closed_image: null };
    if (subcommand === "both") data = { open_image: null, closed_image: null };

    const {
      name: businessName,
      owner,
      open_image,
      closed_image,
    } = (
      await Businesses.findByPk(name, {
        attributes: ["name", "owner", "open_image", "closed_image"],
      })
    ).dataValues;

    if (owner !== interaction.member.id && !hasPerms(interaction.member)) {
      const embed = new EmbedBuilder()
        .setColor(Colours.error)
        .setTitle("Access Denied")
        .setDescription("You do not have permission to use this command.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const affectedRows = await Businesses.update(data, {
      where: { id: name },
    });

    if (affectedRows > 0) {
      const embed = new EmbedBuilder()
        .setColor(Colours.success)
        .setTitle("Business Updated")
        .setDescription(
          `**${businessName}** has been updated.\n- Removed **${subcommand}** image${subcommand === "both" ? "s" : ""}.`,
        );
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
        .setColor(Colours.error)
        .setTitle("Image Removed")
        .setDescription(
          `<@${interaction.member.id}> removed ${
            subcommand === "both" ? "all images" : "an image"
          } from **${businessName}**.
          ${subcommand === "both" ? "" : "- Type: **" + subcommand + "_image**"}`,
        )
        .setImage(
          subcommand === "closed"
            ? closed_image
            : subcommand === "open"
              ? open_image
              : undefined,
        );
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
