/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-use-before-define */
import readline from 'node:readline'
import chalk from 'chalk'
import { createLogUpdate } from 'log-update'
import { cursor, erase } from 'sisteransi'
import { sleep } from '../utils/index.js'

let COLORS = [
  '#883AE3',
  '#7B30E7',
  '#6B22EF',
  '#5711F8',
  '#3640FC',
  '#2387F1',
  '#3DA9A3',
  '#47DA93',
].reverse()

let FULL_FRAMES = [
  ...Array.from({ length: COLORS.length - 1 }, () => COLORS[0]),
  ...COLORS,
  ...Array.from({ length: COLORS.length - 1 }, () => COLORS[COLORS.length - 1]),
  ...[...COLORS].reverse(),
]

function frame(offset = 0) {
  const frames = FULL_FRAMES.slice(offset, offset + (COLORS.length - 2))
  if (frames.length < COLORS.length - 2) {
    const filled = Array.from({ length: COLORS.length - frames.length - 2 }).fill(COLORS[0])
    frames.push(...filled as unknown as string)
  }
  return frames
}

// get a reference to scroll through while loading
// visual representation of what this generates:
// gradientColors: "..xxXX"
// referenceGradient: "..xxXXXXxx....xxXX"
let GRADIENT = [...FULL_FRAMES.map((_, i) => frame(i))].reverse()

function updateColor(newColor: string[]) {
  COLORS = newColor
  FULL_FRAMES = [
    ...Array.from({ length: COLORS.length - 1 }, () => COLORS[0]),
    ...COLORS,
    ...Array.from({ length: COLORS.length - 1 }, () => COLORS[COLORS.length - 1]),
    ...[...COLORS].reverse(),
  ]
  GRADIENT = [...FULL_FRAMES.map((_, i) => frame(i))].reverse()
}

function getGradientAnimFrames() {
  return GRADIENT.map(
    colors => ` ${colors.map(g => chalk.hex(g)('█')).join('')}`,
  )
}

/**
 * Generate loading spinner with rocket flames!
 * @param text display text next to rocket
 * @returns Ora spinner for running .stop()
 */
async function gradient(
  text: string,
  { stdin = process.stdin, stdout = process.stdout } = {},
) {
  const logUpdate = createLogUpdate(stdout)
  let i = 0
  const frames = getGradientAnimFrames()
  let interval: NodeJS.Timeout

  const rl = readline.createInterface({ input: stdin, escapeCodeTimeout: 50 })
  readline.emitKeypressEvents(stdin, rl)

  if (stdin.isTTY)
    stdin.setRawMode(true)
  const keypress = (char: string) => {
    if (char === '\x03') {
      spinner.stop()
      process.exit(0)
    }
    if (stdin.isTTY)
      stdin.setRawMode(true)
    stdout.write(cursor.hide + erase.lines(1))
  }

  let done = false
  const spinner = {
    start() {
      stdout.write(cursor.hide)
      stdin.on('keypress', keypress)
      logUpdate(`${frames[0]}  ${text}`)

      const loop = async () => {
        if (done)
          return
        if (i < frames.length - 1)
          i++

        else
          i = 0

        const frame = frames[i]
        logUpdate(`${frame}  ${text}`)
        if (!done)
          await sleep(90)
        loop()
      }

      loop()
    },
    stop() {
      done = true
      stdin.removeListener('keypress', keypress)
      clearInterval(interval)
      logUpdate.clear()
      rl.close()
    },
  }
  spinner.start()
  return spinner
}

export async function spinner(
  {
    start,
    end,
    while: update = () => sleep(100),
    colorArr,
  }: { start: string; end?: string; while: (...args: any) => Promise<any>; colorArr?: string[] },
  { stdin = process.stdin, stdout = process.stdout } = {},
) {
  if (colorArr)
    updateColor(colorArr)

  const act = update()
  const tooslow = Object.create(null)
  const result = await Promise.race([sleep(500).then(() => tooslow), act])
  if (result === tooslow) {
    const loading = await gradient(chalk.green(start), { stdin, stdout })
    await act
    // 防止clear的时候去掉了其他的log
    console.log()
    loading.stop()
  }

  end && stdout.write(`${' '.repeat(5)} ${chalk.green('✔')}  ${chalk.green(end)}\n`)
}
