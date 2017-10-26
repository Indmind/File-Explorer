const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const xml2js = require('xml2js');

class Controller{
    constructor(_win){
        this.currentPath = getUserHome();
        this.pathHistory = [this.currentPath];
        this.indexHistory = 0;
        this.win = _win;
        this.theme = this.createThemePath('bootstrap');
        this.completeList = {
            base: this.currentPath,
            file:[]
        };
        this.showHidden = false;
        this.listFile = {
            all: [],
            hidden: []
        };
        this.usedList = this.listFile.all;
    }
    readDir(){
        console.log("read dir")
        fs.readdir(this.currentPath, (err, res) => {
            if(err) console.log(err);
            console.log(this.currentPath)
            let dataProceced = 0;
            this.completeList = {
                base: this.currentPath,
                backOrNext: [
                    this.getBackAble(), // 0 backable
                    this.getNextAble() // 1 nextable
                ],
                file:[]
            };
            res.forEach((r, i) => {
                fs.stat(`${this.currentPath}\\${r}`, (err, s) => {
                    this.completeList.file[i] = {
                        name: r,
                        stats: s,
                        location: `${this.currentPath}\\${r}`
                    };
                    dataProceced++;
                    //console.log(dataProceced);
                    //console.log(this.completeList[i]);
                    //console.log(dataProceced);
                    if(dataProceced >= res.length) this.setListFile(this.completeList);;
                });
            });
        });
    }
    send(_channel, _data){
        this.win.webContents.send(_channel, _data);
    }
    setTheme(_theme){
        this.send('back:setTheme', this.createThemePath(_theme));
    }
    setListFile(_list){
        //console.log(_list);
        this.listFile.all = _list;
        //console.log(this.listFile.all);
        this.listFile.hidden = _list.file.filter((_file) => {
            return !(/(^|\/)\.[^\/\.]/g).test(_file.name);
        });
        this.readyToSend();
    }
    changeDir(_path){
        //console.log(_path + " lele " + this.pathHistory[this.indexHistory + 1]);
        if(_path != this.pathHistory[this.indexHistory + 1] && this.pathHistory[this.indexHistory + 1] != undefined){
            console.log("beda");
            this.pathHistory.splice(this.indexHistory + 1, this.pathHistory.length - this.indexHistory);
        }
        this.currentPath = _path;
        this.pathHistory.push(this.currentPath);
        this.indexHistory = this.pathHistory.length;
        console.log(this.pathHistory);
        //console.log(this.currentPath);
    }
    setShowHidden(_bool){
        //console.log(this.listFile.hidden);
        this.showHidden = _bool;
        this.usedList = _bool ? this.listFile.all: this.listFile.hidden;
        //console.log(this.usedList);
        this.sendList();
    }
    readyToSend(){
        this.setShowHidden(this.showHidden);
    }
    backDir(){
        if(this.getBackAble()){
            console.log("back");
            let pathTemp = this.currentPath;
            while(this.currentPath == pathTemp){
                this.currentPath = this.pathHistory[--this.indexHistory];
            }
            this.readDir();
        }
    }
    nextDir(){
        if(this.getNextAble()){
            this.currentPath = this.pathHistory[++this.indexHistory];
            this.readDir();
        }
    }
    getBackAble(){
        if(this.indexHistory == 0)
            return false;
        return true;
    }
    getNextAble(){
        if(this.indexHistory >= this.pathHistory.length - 1)
            return false;
        return true;
    }
    sendList(){
        //console.log(this.usedList)
        this.send("list", this.usedList);
    }
    createThemePath(_theme){
        return `${__dirname}/../assets/css/theme/${_theme}.min.css`
    }
    disableButton(_query){
        this.send("back:disableButton", _query);
    }
}

function obj2arr(_obj){
    return Object.keys(_obj).map(key => _obj[key]);
}

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
 
module.exports = {
    getUserHome: getUserHome,
    obj2arr: obj2arr,
    Controller: Controller
}