import winston from 'winston'
import type { Color as ColorType } from 'colors'
import colors from 'colors'
import type { KeysMatching } from 'shared'
import { capitalize } from 'shared'

function formattedDate(d: Date) {
  return `${d.getDate()}:${d.getMonth()}:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
}

const trim = (s: string) => s.trim()

export type Color = KeysMatching<typeof colors, ColorType>

interface ColorKeys { info: Color; error: Color; date: Color }

export class Logger {
  public logger: winston.Logger
  public colorKeys: ColorKeys = {
    error: 'red',
    info: 'yellow',
    date: 'green',
  }

  constructor(filename: string, colorKeys?: Partial<ColorKeys>) {
    this.logger = winston.createLogger({
      transports: [new winston.transports.File({ filename })],
    })

    if (colorKeys)
      this.colorKeys = { ...this.colorKeys, ...colorKeys }
  }

  log(text: string, level: 'info' | 'error' = 'info', overwriteColors: Partial<ColorKeys> = {}) {
    const d = new Date()
    const fd = formattedDate(d)
    const message = `${fd} | ${capitalize(level)}: ${text}`
    this.logger.log({ level, message })

    const ck = { ...this.colorKeys, ...overwriteColors }

    const mSplit = message.split('|').map(trim)
    console.log(
      colors[ck.date](`${mSplit[0]}`),
      '|',
      colors[ck[level]](mSplit[1]!),
    )
  }
}

export default Logger
