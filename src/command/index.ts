/* eslint-disable no-tabs */
/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'
import { printColorLogs, printSuccessLogs, printWarnLogs } from '@winches/utils'
import { readPackage } from 'read-pkg'
import { detect } from '@antfu/ni'
import select from '@inquirer/select'
import prettier from 'prettier'

const defaultBanner = '欢迎使用git-hooks安装工具，git hooks 正在安装中...'
const gradientBanner = printColorLogs(defaultBanner)
const cwd = process.cwd()
const LOCKS = {
  bun: 'bun.lockb',
  pnpm: 'pnpm-lock.yaml',
  yarn: 'yarn.lock',
  npm: 'package-lock.json',
}

export async function start() {
  console.log()
  // 如果标准输出处于交互式终端模式，并且终端支持至少 24 位
  console.log(
    (process.stdout.isTTY && process.stdout.getColorDepth() > 8)
      ? gradientBanner
      : defaultBanner,
  )

  const pkg = await readPackage({
    cwd,
    normalize: false,
  }) as any
  const huskyPath = path.resolve(cwd, '.husky')

  let agent = await detect({ cwd })
  if (!agent) {
    printWarnLogs('未检测到本地包管理，请手动选择')
    agent = await select({
      message: '选择一个包管理',
      choices: [
        {
          name: 'npm',
          value: 'npm',
          description: 'npm is the most popular package manager',
        },
        {
          name: 'yarn',
          value: 'yarn',
          description: 'yarn is an awesome package manager',
        },
        {
          name: 'pnpm',
          value: 'pnpm',
          description: 'pnpm is an awesome package manager',
        },
      ],
    })
  }
  else { printSuccessLogs(`检测到本地包管理: ${agent}`) }

  const locks = LOCKS[agent as keyof typeof LOCKS]
  const hooksBash = `#!/usr/bin/env bash
changed_files="$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)"

check_run() {
	echo "$changed_files" | grep --quiet "$1" && eval "$2"
}

check_run ${locks} "${agent} install"
`
  const hooksBin = `#!/usr/bin/env bash
huskyDir=$(dirname -- "$0")
. "$huskyDir/_/husky.sh"

. "$huskyDir/scripts/update-dep.sh"
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
            'post-merge': '. \"./.husky/scripts/update-dep.sh\"',
            'post-rebase': '. \"./.husky/scripts/update-dep.sh\"',
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

  if (!isExistHuskyPkg && !isExistHusky)
    printWarnLogs('git hooks 安装失败，目前只支持搭配 husky 使用')
  else
    printSuccessLogs('安装 git hooks !')

  function addHooks() {
    fs.writeFileSync(path.resolve(huskyPath, 'post-merge'), hooksBin, 'utf-8')
    fs.writeFileSync(path.resolve(huskyPath, 'post-rebase'), hooksBin, 'utf-8')
  }

  function addScripts() {
    fs.writeFileSync(path.resolve(scriptDir, 'update-dep'), hooksBash, 'utf-8')
  }
}
