# ts-start

[![NPM version](https://img.shields.io/npm/v/pkg-name?color=a1b858&label=)](https://www.npmjs.com/package/pkg-name)

## 背景
### 项目多人协作的困扰

相信大家多多少少都遇到过，当主线分支的代码，合入到自己的分支的时候，如果这时候，主线中有一些**依赖的更新或者添加或者删除**，如果合入之后，没有及时的`install`的话，项目启动的时候，可能就会报错！

## ⭐️ 功能
### 自动安装 git hooks

![2023-08-06 13 49 09](https://github.com/winchesHe/git-cli/assets/96854855/98f40324-63fd-454c-abf2-5eb37d51e380)

## 使用

```bash
npx @winches/git-cli
```

```bash
npm i -g @winches/git-cli
# 运行
git-cli
```

## hooks 功能

### 当检测到 `lock` 文件变更时，重新安装依赖

<img width="468" alt="image" src="https://github.com/winchesHe/git-cli/assets/96854855/26565e15-0700-4715-8fc9-fba6a733669b">
