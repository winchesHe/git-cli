#!/usr/bin/env node
import { Command } from 'commander'
import pkg from '../package.json'
import { start } from './command/index'

const program = new Command()
program.version(pkg.version, '-v --version', '显示当前版本号')

program
  .description('ts cli 模版目录')
  .option('-n, --name [projectName]', '项目名')
  .action(start)

program.parse(process.argv)
