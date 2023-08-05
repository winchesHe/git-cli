import inquirer from 'inquirer'

export const getName = async (): Promise<string> => {
  const strName = {
    type: 'input',
    name: 'projectName',
    message: '请填写项目名: ',
    default: 'project-name',
  }
  return (await inquirer.prompt([strName])).projectName
}
