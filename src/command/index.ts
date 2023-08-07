/* eslint-disable no-console */
/* eslint-disable no-tabs */
import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import { printColorLogs, printSuccessLogs, printWarnLogs } from '@winches/utils'
import { readPackage } from 'read-pkg'
import select from '@inquirer/select'
import prettier from 'prettier'
import { detect, generateSmoothGradient, sleep, spinner } from '../utils'

const defaultBanner = '欢迎使用 git-hooks 安装工具'
const gradientBanner = printColorLogs(defaultBanner)
const cwd = process.cwd()
const LOCKS = {
  bun: 'bun.lockb',
  pnpm: 'pnpm-lock.yaml',
  yarn: 'yarn.lock',
  npm: 'package-lock.json',
}
const COLORS = generateSmoothGradient('#5ffbf1', '#86a8e7', 8).reverse()

export async function start() {
  console.log(
    (process.stdout.isTTY && process.stdout.getColorDepth() > 8)
      ? `🚀 ${gradientBanner}`
      : defaultBanner,
  )

  let agent = await detect({ cwd })
  if (!agent) {
    printWarnLogs('未检测到本地包管理，请手动选择')
    agent = await select({
      message: '选择一个包管理',
      choices: [
        {
          name: 'npm',
          value: 'npm',
          description: 'npm 包管理工具',
        },
        {
          name: 'yarn',
          value: 'yarn',
          description: 'yarn 包管理工具',
        },
        {
          name: 'pnpm',
          value: 'pnpm',
          description: 'pnpm 包管理工具',
        },
      ],
    })
  }
  else {
    printSuccessLogs(`检测到本地包管理: ${agent}`)
  }
  console.log()

  const _while = () => {
    return run()
  }
  await spinner({
    start: printColorLogs('git hooks 正在安装中...'),
    while: _while,
    colorArr: COLORS,
  })

  async function run() {
    const pkg = await readPackage({
      cwd,
      normalize: false,
    }) as any
    const huskyPath = path.resolve(cwd, '.husky')

    await sleep(3000)

    const locks = LOCKS[agent as keyof typeof LOCKS]
    const hooksBash = `#!/usr/bin/env bash
changed_files="$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)"

check_run() {
  if (echo "$changed_files" | grep --quiet "$1"); then
    echo "检测到 pnpm-lock.yaml 变更，开始更新依赖"
    eval "$2"
  fi
}

check_run ${locks} "${agent} install"
`
    const hooksBin = `#!/usr/bin/env bash
huskyDir=$(dirname -- "$0")
. "$huskyDir/_/husky.sh"

. "$huskyDir/scripts/update-dep"
`

    let isExistHuskyPkg = false
    const isExistHusky = !!fs.existsSync(huskyPath)
    const scriptDir = path.resolve(huskyPath, 'scripts')

    if (pkg.husky) {
      isExistHuskyPkg = true
      !fs.existsSync(scriptDir) && fs.mkdirSync(scriptDir, { recursive: true })

      if (!isExistHusky) {
      // 如果package.json里存在husky的hooks配置，则加在这里
        if (pkg.husky.hooks) {
          pkg.husky.hooks = {
            ...pkg.husky.hooks,
            ...({
              'post-merge': '. \"./.husky/scripts/update-dep\"',
              'post-rebase': '. \"./.husky/scripts/update-dep\"',
            }),
          }

          const outputPkg = await prettier.format(JSON.stringify(pkg), { parser: 'json-stringify' })
          fs.writeFileSync(path.resolve(cwd, 'package.json'), outputPkg, 'utf-8')
        }
        else {
        // 如果不存在，则直接添加在.husky目录
          addHooks()
        }
      }
      addScripts()
    }

    if (isExistHusky) {
      !fs.existsSync(scriptDir) && fs.mkdirSync(scriptDir)
      addScripts()
      addHooks()
    }

    if (!isExistHuskyPkg && !isExistHusky) {
      printWarnLogs('git hooks 安装失败，目前只支持搭配 husky 使用')
    }
    else {
      const cmd1 = 'chmod +x .husky/post-merge'
      const cmd2 = 'chmod +x .husky/post-rebase'
      exec(cmd1)
      exec(cmd2)
      printSuccessLogs('✨ 安装 git hooks !')
    }

    function addHooks() {
      fs.writeFileSync(path.resolve(huskyPath, 'post-merge'), hooksBin, 'utf-8')
      fs.writeFileSync(path.resolve(huskyPath, 'post-rebase'), hooksBin, 'utf-8')
    }

    function addScripts() {
      fs.writeFileSync(path.resolve(scriptDir, 'update-dep'), hooksBash, 'utf-8')
    }
  }
}
