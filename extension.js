// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const LifeTodo = require('./src/LifeTodo');


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    let userConfigure = vscode.workspace.getConfiguration('life-todo');

    // Use the console to output diagnostic information (console.log) and errors (console.erroris line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "life-todo" is now active!');
    LifeTodo.start(false, userConfigure);

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let ltodoStart = vscode.commands.registerCommand('extension.LifeTodoStart', function () {
        LifeTodo.start(true);
    });

    let ltodoStop = vscode.commands.registerCommand('extension.LifeTodoStop', function () {
        LifeTodo.stop();
    });

    let ltodoList = vscode.commands.registerCommand('extension.LifeTodoList', function () {
        LifeTodo.list();
    });

    context.subscriptions.push(ltodoList);
    context.subscriptions.push(ltodoStart);
    context.subscriptions.push(ltodoStop);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;