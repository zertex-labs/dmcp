import { ActionRowBuilder, ComponentType, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js'
import type { ServiceResponse, Shop, ShopItem } from 'shared'
import { config } from 'src/config'
import type { Command } from 'src/types'
import { makeButtonRow, predefinedButtons } from 'src/utils'
import { apiSecretHeaders } from 'src/utils/headers'

function constructShopReply(date: string, shop: Shop) {
  const itemSelect = new StringSelectMenuBuilder()
    .setCustomId('shop:itemSelect')
    .setPlaceholder('Select an item to purchase')
    .addOptions(
      ...shop.items.map((item, k) => new StringSelectMenuOptionBuilder()
        .setLabel(`${item.type === 'pet' ? item.rarity : item.type.toUpperCase()} - ${item.key}`)
        .setValue(`${k}`)
        .setDescription(`🪙 ${item.price}`),
      ),
    )

  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(`Shop - ${date}`)
        .addFields(
          ...shop.items.map(item => ({
            name: `${item.type === 'pet' ? item.rarity : item.type.toUpperCase()} - ${item.key}`,
            value: `🪙 ${item.price}`,
            inline: true,
          })),
        ),
    ],
    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      itemSelect,
    )],
  }
}

function isValidDateString(str: string): str is `${number}-${number}-${number}` {
  const [day, month, year] = str.split('-').map(Number)
  return !Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)
}

export default {
  name: 'shop',
  description: 'Run this command to open shop',

  run: async ({ interaction, client, state, invokeHelper }) => {
    // dd-mm-yyyy
    const date = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replaceAll('/', '-')

    await interaction.deferReply()

    if (!isValidDateString(date)) throw new Error('Bruh our devs are braindead')
    state.date = date

    const res: ServiceResponse<Shop> = await fetch(`${config.env.API_URL}/api/shop/${date}`, {
      headers: apiSecretHeaders,
    }).then(res => res.json()).catch(client.error.bind(client))

    if (res.status === 'error') {
      const msg = `Something went wrong while fetching the shop for date ${date}.`
      interaction.editReply(`${msg}${res.statusCode < 500 ? ` Error: ${res.error}` : ''}`)
      return
    }

    const shop = res.data
    state.shop = shop

    state.initialShopReply = constructShopReply(date, shop)

    const reply = await interaction.editReply(state.initialShopReply)

    const collector = reply.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      componentType: ComponentType.StringSelect,
      time: 30 * 1000,
    })

    const onEnd = () => {
      interaction.deleteReply().catch()
    }
    collector.on('collect', async (i) => {
      console.log(i.message.id)
      invokeHelper('handleMenu', {
        interaction: i,
      })

      // i hate discordjs with a passion. why the fuck not dispose after collect??? like the user clicked the button????
      collector.off('end', onEnd)
    })

    collector.on('end', onEnd)
  },

  helpers: {
    handleMenu: async ({ interaction, state, client, helpers }) => {
      if (!interaction.isStringSelectMenu()) return

      const { shop, date } = state
      const idx = Number.parseInt(interaction.values[0]!)
      const item = shop.items[idx]

      if (!item) {
        client.interactionError(interaction, `Invalid item idx, ${idx}\n${shop}`)
        return
      }

      state.item = item

      const reply = await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Shop - ${date}`)
            .setDescription(`Are you sure you want to buy **${item.key}** for **${item.price}**?`),
        ],
        components: [makeButtonRow(predefinedButtons.confirm('shop'), predefinedButtons.cancel('shop'))],
      })

      const collector = reply.createMessageComponentCollector({
        filter: i => interaction.customId.startsWith('shop') && i.user.id === interaction.user.id,
        time: 2 * 1000,
      })

      const onEnd = () => {
        interaction.deleteReply().catch()
      }
      collector.on('collect', (i) => {
        console.log('collct btn')
        const action = i.customId.split(':')[1] as 'confirm' | 'cancel'

        if (action === 'cancel') {
          i.update(state.initialShopReply)
          return
        }

        console.log('collected btn')
        helpers.handlePurchase({
          interaction: i,
          client,
          helpers,
          state,
        })

        collector.off('end', onEnd)
      })

      collector.on('end', onEnd)
    },
    handlePurchase: ({ interaction, state }) => {
      const item = state.item!
      const user = interaction.user
      console.log('handlePurchase', user.username, item)
    },
  },
} satisfies Command<{
  shop: Shop
  date: `${number}-${number}-${number}`
  initialShopReply: ReturnType<typeof constructShopReply>
  item?: ShopItem
}, ['handleMenu', 'handlePurchase']>
