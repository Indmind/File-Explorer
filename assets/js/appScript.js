const {
    ipcRenderer
} = require('electron');
let listFile = [];
let curFolder = '';

window.onload = () => {
    ipcRenderer.send("front:firstLoads", null);
};

function runFile(_filePath, _type){
    if(_type == "folder"){
        ipcRenderer.send("front:changeDir", _filePath);
    }else{
        ipcRenderer.send("front:execFile", _filePath);
    }
}

$("#back-btn").click(() => {
    ipcRenderer.send("front:backDir");
});

$("#next-btn").click(() => {
    ipcRenderer.send("front:nextDir");
});

ipcRenderer.on("list", (err, data) => {
    if (typeof onListEnter === "function") { 
        // safe to use the function
        onListEnter(data);
    }
    // data.forEach((d) => {
    //     console.log(d);
    // });
});

function setTitle(path){
    document.title = path;
    curFolder = path.split('\\').pop();
    $("#pathInput").val(path);
    $("#header").html(curFolder);
}

$("#pathInput").keypress((e) => {
    if(e.which == 13){
        ipcRenderer.send("front:changeDir", $("#pathInput").val());
    }
 });

function setBackAbleAndNextAble(_arr){
    // backable
    if(_arr[0]){
        $("#back-btn").removeClass("disabled");
    }else{
        $("#back-btn").addClass("disabled");
    }
    // nextable
    if(_arr[1]){
        $("#next-btn").removeClass("disabled");
    }else{
        $("#next-btn").addClass("disabled");
    }
}

ipcRenderer.on("back:setTheme", (err, path) => {
    $("#main-theme").attr('href', path);
    console.log(path);
});

ipcRenderer.on("back:error", (err, _err) => {
    alert(objToString(_err));
})

function objToString (obj) {
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += p + '::' + obj[p] + '\n';
        }
    }
    return str;
}