/* eslint-disable no-console */
import { printColorLogs } from '@winches/utils'

const defaultBanner = 'all are created with Typescript'
const gradientBanner = printColorLogs(defaultBanner)

export async function start(options: { name?: string }) {
  console.log()
  // 如果标准输出处于交互式终端模式，并且终端支持至少 24 位
  console.log(
    (process.stdout.isTTY && process.stdout.getColorDepth() > 8)
      ? gradientBanner
      : defaultBanner,
  )
  console.log()
}
