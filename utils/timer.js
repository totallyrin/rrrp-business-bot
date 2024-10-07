const cron = require("node-cron");
const { Businesses, Employees } = require("./db");
const { Op } = require("sequelize");
const { EmbedBuilder } = require("discord.js");
const { Colours } = require("./colours");
const { Channels } = require("../config");

module.exports = {
  async startTimer(client) {
    cron.schedule("0 12 * * *", async () => {
      // fetch businesses that have not been opened and are owned
      const businesses = await Businesses.findAll({
        where: {
          last_opened: {
            [Op.lt]: new Date(new Date() - 14 * 24 * 60 * 60 * 1000), // check 14 days ago
            // [Op.lt]: new Date(new Date() - 5 * 1000), // check 5 minutes
          },
          owner: {
            [Op.ne]: null,
          },
        },
      });

      for (const business of businesses) {
        // if warned, seize business, else issue warning
        if (business.dataValues.warned) {
          // seize
          let channel = client.channels.cache.get(Channels.closures);

          if (!channel) {
            try {
              channel = await client.channels.fetch(Channels.closures);
            } catch (error) {
              console.error(`Error fetching channel: ${error}`);
            }
          }

          try {
            await Businesses.update(
              { owner: null, warned: false },
              { where: { id: business.dataValues.id } },
            );
            await Employees.destroy({ where: { business_id: business } });

            const warning = new EmbedBuilder()
              .setColor(Colours.warning_light)
              .setTitle("Business Seized")
              .setDescription(
                `## ${business.dataValues.name} ##\n- This business has been **inactive** since **${business.dataValues.last_opened.toLocaleDateString(
                  "en-US",
                  {
                    // year: "numeric",
                    month: "long", // full month name
                    day: "numeric", // day of the month
                  },
                )}**.\n- As a result, **it has been seized**, per <#${Channels.rules}>.`,
              );
            await channel.send({
              content: `<@${business.dataValues.owner}>`,
              embeds: [warning],
            });

            channel = client.channels.cache.get(Channels.logs);

            if (!channel) {
              try {
                channel = await client.channels.fetch(Channels.logs);
              } catch (error) {
                return console.error(`Error fetching channel: ${error}`);
              }
            }

            const log = new EmbedBuilder()
              .setColor(Colours.warning)
              .setTitle("Business Seized")
              .setDescription(
                `<@${process.env.CLIENT_ID}> seized **${business.dataValues.name}**.\n- Type: **${business.dataValues.type}**${business.dataValues.owner ? `\n- Owner: <@${business.dataValues.owner}>` : ""}`,
              );
            return channel.send({ embeds: [log] });
          } catch (error) {
            console.error(error);
          }
        } else {
          // warn
          let channel = client.channels.cache.get(Channels.warnings);

          if (!channel) {
            try {
              channel = await client.channels.fetch(Channels.warnings);
            } catch (error) {
              console.error(`Error fetching channel: ${error}`);
            }
          }

          try {
            await Businesses.update(
              { warned: true },
              { where: { id: business.dataValues.id } },
            );

            const warning = new EmbedBuilder()
              .setColor(Colours.warning_light)
              .setTitle("Inactivity Warning")
              .setDescription(
                `## ${business.dataValues.name} ##\n- Your business has been **inactive** since **${business.dataValues.last_opened.toLocaleDateString(
                  "en-US",
                  {
                    // year: "numeric",
                    month: "long", // full month name
                    day: "numeric", // day of the month
                  },
                )}**.\n- You have **24 hours** to open your business through <#${Channels.marketplace}>.\n- Failure to do so will result in the **seizure of your business** and you will no longer have access to business specific crafting or storage.\n- **This is the only warning you will receive for this matter.**`,
              );
            await channel.send({
              content: `<@${business.dataValues.owner}>`,
              embeds: [warning],
            });

            channel = client.channels.cache.get(Channels.logs);
            if (!channel) {
              try {
                channel = await client.channels.fetch(Channels.logs);
              } catch (error) {
                return console.error(`Error fetching channel: ${error}`);
              }
            }

            const log = new EmbedBuilder()
              .setColor(Colours.warning)
              .setTitle("Warning Issued")
              .setDescription(
                `<@${process.env.client_id}> issued an inactivity warning for **${business.dataValues.name}**.\n- Type: **${business.dataValues.type}**${business.dataValues.owner ? `\n- Owner: <@${business.dataValues.owner}>` : ""}`,
              );
            return channel.send({ embeds: [log] });
          } catch (error) {
            console.error(error);
          }
        }
      }
    });
  },
};
