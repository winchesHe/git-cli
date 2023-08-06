#!/usr/bin/env node
import { Command } from 'commander'
import pkg from '../package.json'
import { start } from './command/index'

const program = new Command()

program.version(pkg.version, '-v --version', '显示当前版本号')

program
  .description('git cli 为项目安装post-merge和post-rebase钩子')
  .action(start)

program.parse(process.argv)
