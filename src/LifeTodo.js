const vscode = require('vscode');
const fs = require('fs');

let LifeTodoDataStore = {
    //配置状态
    config: {
        //关键词匹配正则
        keyWordsReg: null,
        //life文件是否获得焦点
        isLifeFileOpened: null
    },
    //数据
    data: {}
};

function onDidChangeActive(arg, vscode, userConfig, fs) {
    //life文件打开时写入缓存,life文件窗口失去焦点时,保存内容并将文件内容加载到缓存中. 
    if (vscode.window.activeTextEditor.document.fileName == userConfig.lifeFilePath) {
        LifeTodoDataStore.config.isLifeFileOpened = true;
        console.log("缓存 ->  文件");
        let lifeTodoStr = "";
        for (var key in LifeTodoDataStore.data) {
            let lifeData = LifeTodoDataStore.data[key];
            let lifeStr = userConfig.todoTemplate;

            lifeStr = lifeStr.replace("{content}", lifeData.content);
            lifeStr = lifeStr.replace("{filename}", lifeData.path);
            lifeStr = lifeStr.replace("{rownum}", lifeData.location);
            lifeStr = lifeStr.replace("{time}", lifeData.createTime);
            lifeStr = lifeStr.replace("{todoID}", lifeData.id);

            lifeTodoStr += (lifeStr + "\n");
        }

        fs.writeFile(userConfig.lifeFilePath, lifeTodoStr, (err) => {
            if (err) throw err;
            console.log('It\'s saved!');
        });


    } else {
        if (LifeTodoDataStore.config.isLifeFileOpened) {
            console.log("文件 -> 缓存");
            let text = fs.readFileSync(userConfig.lifeFilePath, 'utf8');
            // 将文件按行拆成数组
            let lineArr = text.split(/\r|\n/);

            let todoObj = null;
            for (let i = 0; i < lineArr.length; i++) {
                let lineStr = lineArr[i].trim();

                if (lineStr.indexOf("# ") == 0) {
                    if (todoObj != null) {
                        LifeTodoDataStore.data[todoObj.id] = todoObj;
                    }
                    todoObj = {};
                    todoObj.content = lineStr.substring(2);
                } else if (lineStr.indexOf("- ") == 0) {

                    todoObj.id = lineStr.substring(2);
                    todoObj.location = todoObj.id.substring(0, todoObj.id.indexOf(":"));
                    todoObj.path = todoObj.id.substring(todoObj.id.indexOf(":"));

                } else if (lineStr.indexOf("+ ") == 0) {

                    todoObj.createTime = lineStr.substring(2);

                }

            }
            LifeTodoDataStore.data[todoObj.id] = todoObj;
            LifeTodoDataStore.config.isLifeFileOpened = false;
        }
    }
}

function onDidTextChange(arg, vscode, userConfig) {
    // 如果不是life文件则检测TODO
    let line = arg[0].selections[0].start.line;
    let lineStr = arg[0].textEditor.document.lineAt(line).text;
    let keyLocation = lineStr.split(LifeTodoDataStore.config.keyWordsReg);
    let kind = arg[0].kind;

    if (kind != 1) return;

    if (keyLocation.length > 1) {

        //梳理todo对象
        let todoObj = {
            id: line + ":" + vscode.window.activeTextEditor.document.fileName,
            content: keyLocation[1],
            createTime: new Date().toLocaleString(),
            path: vscode.window.activeTextEditor.document.fileName,
            location: line
        };

        //写入缓存
        LifeTodoDataStore.data[todoObj.location + ":" + todoObj.path] = todoObj;
    } else {
        delete LifeTodoDataStore.data[line + ":" + vscode.window.activeTextEditor.document.fileName];
    }
}

function OnStart(_isCommand, _userConfigure) {
    LifeTodoDataStore.config.keyWordsReg = new RegExp(_userConfigure.todoKeyWords);

    let text = fs.readFileSync(_userConfigure.lifeFilePath, 'utf8');
    // 将文件按行拆成数组
    let lineArr = text.split(/\r|\n/);

    let todoObj = null;
    for (let i = 0; i < lineArr.length; i++) {
        let lineStr = lineArr[i].trim();

        if (lineStr.indexOf("# ") == 0) {
            if (todoObj != null) {
                LifeTodoDataStore.data[todoObj.id] = todoObj;
            }
            todoObj = {};
            todoObj.content = lineStr.substring(2);
        } else if (lineStr.indexOf("- ") == 0) {
            todoObj.id = lineStr.substring(2);
            todoObj.location = todoObj.id.substring(0, todoObj.id.indexOf(":"));
            todoObj.path = todoObj.id.substring(todoObj.id.indexOf(":"));
        } else if (lineStr.indexOf("+ ") == 0) {
            todoObj.createTime = lineStr.substring(2);
        }
    }
    LifeTodoDataStore.data[todoObj.id] = todoObj;
    //life文件打开时写入缓存,life文件窗口失去焦点时,保存内容并将文件内容加载到缓存中.
    vscode.window.onDidChangeActiveTextEditor(function () {
        onDidChangeActive(arguments, vscode, _userConfigure, fs);
    });
    //检测非life文件TODO
    vscode.window.onDidChangeTextEditorSelection(function () {
        onDidTextChange(arguments, vscode, _userConfigure);
    });
    //vscode.window.showInformationMessage('life todo start');
}

function OnStop() {
    //TODO: 停止一切与lifetodo有关的触发
    //vscode.window.showInformationMessage('life todo stop');
}

function OnLTodoList() {
    //TODO: 打开list 文件
    //vscode.window.showInformationMessage('life todo list');
}

module.exports = {
    start: OnStart,
    stop: OnStop,
    list: OnLTodoList
};