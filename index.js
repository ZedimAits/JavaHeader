//TODO
//-add methods in header

const fs = require("fs");
const { resolve, basename, join, dirname } = require("path");
const PATHTOFILE = resolve(process.argv[2]);
let STATUS = [];

//MAIN
updateHeader();
console.log("Watching for file changes...");

fs.watchFile(PATHTOFILE, () => {
    console.log("File has changed");
    updateHeader();
});
fs.watchFile(getHeaderPath(), () => {
    console.log("Header has changed");
    updateFile();
});

function updateFile() {
    //compare status
    //if invalid overwrite
    //if same do nothing
    //if valid continue
    let newObj = getHeaderContent();

    let equal = checkIfValid(newObj, STATUS);
    if (!equal) {
        updateHeader();
        console.log("NOT VALID");
        return;
    }
    //type: Array[Array[{String,Obj}]]
    let diff = [];
    getDifference(newObj, STATUS, diff, "", 0);

    //TODO:
    //-for each find appropiate place in code and write new
    for (let i = 0; i < diff.length; i++) {
        for (let j = 0; j < diff[i].length; j++) {
            const e = diff[i][j];
            const str = rekString(e.obj, e.depth, "{}");
            writeChanges(e.parent, str);
        }
    }
    updateHeader();
}

function writeChanges(parent, str) {
    //findLine
    const content = readFileContent(PATHTOFILE);
    let index = 0;
    if (parent === "") index = content.length;
    else {
        let regex = new RegExp(parent, "g");
        index = regex.exec(content).index;

        let curlCount = 0;
        let curlPos = -1;

        for (i = index; i < content.length; i++) {
            if (content[i] == "{") {
                curlCount++;
                curlPos = i;
            }
            if (content[i] == "}") {
                curlCount--;
            }
            if (curlCount == 0 && curlPos != -1) {
                index = i;
                break;
            }
        }
    }
    const splitA = content.substring(0, index);
    const splitB = content.substring(index);
    fs.writeFileSync(PATHTOFILE, splitA + "\n" + str + splitB);
}

function getHeaderContent() {
    const string = readFileContent(getHeaderPath())
        .replaceAll(";", "{}")
        .replaceAll("\n", "")
        .replace(/\s{2,}/g, " ");
    return rekObj(string);
}

function getDifference(nobj, stat, returnArr, parent, depth) {
    if (nobj.length === 0) return;
    if (nobj.length > stat.length) {
        let obj = [];
        for (let j = stat.length; j < nobj.length; j++) {
            obj.push({ parent: parent, depth: depth, obj: [nobj[j]] });
        }
        returnArr.push(obj);
    }
    for (let i = 0; i < stat.length; i++) {
        getDifference(
            nobj[i].attributes,
            stat[i].attributes,
            returnArr,
            nobj[i].name,
            depth + 1
        );
    }
}

function checkIfValid(nobj, stat) {
    if (stat.length === 0) return true;
    if (nobj.length < stat.length) return false;
    let o = true;
    for (let i = 0; i < stat.length; i++) {
        if (nobj[i].name != stat[i].name) return false;
        o = o && checkIfValid(nobj[i].attributes, stat[i].attributes);
    }
    return o;
}

function updateHeader() {
    const content = readFileContent(PATHTOFILE);
    const str = getHeaderString(content);
    writeToHeader(str);
}
function readFileContent(path) {
    return fs.readFileSync(path).toString();
}

function rekObj(string) {
    if (string === "") return [];
    let o = [];
    let str = "";
    let curlCount = 0;
    let curlPos = 0;
    for (let i = 0; i < string.length; i++) {
        const x = string[i];
        if (x === "{") {
            if (curlCount === 0) curlPos = i;
            curlCount++;
        }

        if (curlCount === 0) str += x;

        if (x === "}") {
            curlCount--;
            if (curlCount === 0) {
                str = str.trim();
                const between = string.slice(curlPos + 1, i);

                if (
                    !str.includes(" if") &&
                    str.substring(0, 2) != "if" &&
                    str.substring(0, 4) != "else"
                ) {
                    const push = { name: str, attributes: rekObj(between) };
                    o.push(push);
                }
                str = "";
            }
        }
    }

    return o;
}

function strMult(str, times) {
    let o = "";
    for (let j = 0; j < times; j++) o += str;
    return o;
}
function rekString(obj, depth, ending) {
    if (obj.length === 0) return "";
    let o = "";
    for (let i = 0; i < obj.length; i++) {
        let str = "";
        const tab = strMult("\t", depth);
        str += tab;
        str += obj[i].name;
        if (obj[i].attributes.length != 0)
            str +=
                " {\n" +
                rekString(obj[i].attributes, depth + 1, ending) +
                tab +
                "}\n";
        else str += ending + "\n";
        o += str;
    }
    return o;
}

function getHeaderString(fileContent) {
    const text = fileContent;
    const signatures = text
        .replace(/\/\*[^\*\/]*\*\//g, "")
        .replace(/[^{}]*(?=\})/g, "")
        .replace(/[^}{;]*;/g, "")
        .replace("\n", "")
        .trim()
        .replace(/\s{2,}/g, " ");

    const obj = rekObj(signatures);
    STATUS = obj;

    let finalString = rekString(obj, 0, ";");
    return finalString;
}
function sPrint(p) {
    const util = require("util");

    console.log(
        util.inspect(p, { showHidden: false, depth: null, colors: true })
    );
}

function writeToHeader(content) {
    console.log(getHeaderPath());
    fs.writeFileSync(getHeaderPath(), content);
}

function getHeaderPath() {
    const name = basename(PATHTOFILE, ".java");
    return join(dirname(PATHTOFILE), name + ".h");
}
