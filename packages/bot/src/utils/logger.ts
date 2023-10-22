import winston from 'winston'
import colors from 'colors'
import { capitalize } from 'shared'

function formattedDate(d: Date) {
  return `${d.getDate()}:${d.getMonth()}:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
}

const trim = (s: string) => s.trim()

class Logger {
  public logger: winston.Logger
  constructor(filename: string) {
    this.logger = winston.createLogger({
      transports: [new winston.transports.File({ filename })],
    })
  }

  log(text: string, level: 'info' | 'error' = 'info') {
    const d = new Date()
    const fd = formattedDate(d)
    const message = `${fd} | ${capitalize(level)}: ${text}`
    this.logger.log({ level, message })

    const mSplit = message.split('|').map(trim)
    console.log(
      colors.green(`${mSplit[0]}`),
      '|',
      colors[level === 'info' ? 'yellow' : 'red'](mSplit[1]),
    )
  }
}

export default Logger
