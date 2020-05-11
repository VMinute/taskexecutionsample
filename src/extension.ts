// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { EventEmitter } from 'events';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "taskexecutionsample" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.runTask', async () => {
        // load task list
        var tasks = await vscode.tasks.fetchTasks();
        var taskA: vscode.Task | undefined = undefined;

        // search for a task named "A"
        for (var t of tasks) {
            if (t.name === "A") {
                taskA = t;
                break;
            }
        }

        if (taskA === undefined) {
            vscode.window.showErrorMessage("Can't find a task named A.");
            return;
        }

        // emitter used to detect task completition
        var emitter = new EventEmitter();

        // the process event arrives before the generic terminate one (checked inside vscode sources)
        vscode.tasks.onDidStartTaskProcess(e => {
            console.log("Task " + e.execution.task.name + " started.")
        });

        vscode.tasks.onDidEndTaskProcess(e => {
            console.log("Task process " + e.execution.task.name + " terminated.")
            if (e.execution.task.name === "A") {
                emitter.emit("terminated", e.exitCode);
            }
        });
        vscode.tasks.onDidEndTask(e => {
            console.log("Task process " + e.execution.task.name + " terminated.")
            if (e.execution.task.name === "A") {
                emitter.emit("terminated", -1);
            }
        });

        try {
            var execution = await vscode.tasks.executeTask(taskA);
        }
        catch (e) {
            console.log("Task execution generated an exception.");
            return null;
        }

        var code = await new Promise<Number>((resolve, reject) => {
            emitter.on("terminated", code => resolve(code));
        });

        vscode.window.showInformationMessage("Task A terminated with exit code " + code.toString());
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
