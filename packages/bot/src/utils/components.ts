import { ActionRowBuilder, ButtonBuilder, ButtonStyle as CringeButtonStyle } from 'discord.js'
import type { KeysOf } from 'shared'

type ButtonStyle = KeysOf<typeof CringeButtonStyle>

export function makeButton(opt?: Partial<{
  id: string
  disabled: boolean
  emoji: string
  label: string
  style: ButtonStyle
  url: string
}>) {
  const o = opt ?? {}
  const builder = new ButtonBuilder()

  if (o.id) builder.setCustomId(o.id)
  if (o.disabled) builder.setDisabled(o.disabled)
  if (o.emoji) builder.setEmoji(o.emoji)
  if (o.label) builder.setLabel(o.label)
  if (o.style) builder.setStyle(CringeButtonStyle[o.style])
  if (o.url) builder.setURL(o.url)

  return builder
}

export const predefinedButtons = {
  confirm: p => makeButton({
    id: `${p ? `${p}:` : ''}confirm`,
    label: 'Confirm',
    style: 'Primary',
  }),
  cancel: p => makeButton({
    id: `${p ? `${p}:` : ''}cancel`,
    label: 'Cancel',
    style: 'Danger',
  }),
} as const satisfies Record<string, (prefix?: string) => ButtonBuilder>

export function makeButtonRow(...buttons: ButtonBuilder[]) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons)
}
