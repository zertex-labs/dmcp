import winston from 'winston'
import type { Color as ColorType } from 'colors'
import colors from 'colors'

import { capitalize } from './string'
import { KeysMatching } from '../types'

function formattedDate(d: Date) {
  return `${d.getDate()}:${d.getMonth()}:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
}

export type Color = KeysMatching<typeof colors, ColorType>

export type LogLevel = 'info' | 'error' | 'warn'
type AdditionalColorsKeys = 'date' | 'prefix'

type ColorKeys = Record<LogLevel | AdditionalColorsKeys, Color>

export type OverwriteColors = Partial<ColorKeys>

export class Logger {
  public logger: winston.Logger
  public colorKeys: ColorKeys = {
    error: 'red',
    info: 'green',
    warn: 'yellow',
    prefix: 'gray',
    date: 'green',
  }

  constructor(filename: string, colorKeys?: OverwriteColors) {
    this.logger = winston.createLogger({
      transports: [new winston.transports.File({ filename })],
    })

    if (colorKeys)
      this.colorKeys = { ...this.colorKeys, ...colorKeys }
  }

  log(text: string, level: LogLevel = 'info', additional?: Partial<{ prefix: string; overwriteColors: OverwriteColors }>) {
    const {
      prefix = capitalize(level),
      overwriteColors = {},
    } = additional ?? {}

    const ck = { ...this.colorKeys, ...overwriteColors }
    const withColor = (s: string, key: keyof ColorKeys) => colors[ck[key]](s)

    const d = new Date()
    const fd = formattedDate(d)
    const message = `${withColor(fd, 'date')} | ${withColor(prefix, 'prefix')}: ${withColor(text, level)}`

    this.logger.log({ level, message: colors.stripColors(message) })

    console.log(message)
  }
}

export default Logger
