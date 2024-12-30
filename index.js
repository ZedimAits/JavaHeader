import antlr4 from "antlr4";
import JavaLexer from "./parser/JavaLexer.js";
import JavaParser from "./parser/JavaParser.js";
import fs from "fs";
import path from "path";

const PATHTOFILE = path.resolve(process.argv[2]);
const HEADERFILE = path.join(path.dirname(PATHTOFILE), path.basename(PATHTOFILE, ".java") + ".h");

updateHeader();
console.log("Watching for file changes...");
fs.watch(PATHTOFILE, (eventType) => {
    if (eventType === "change") {
        updateHeader();
    }
});

function updateHeader(){
    const input = fs.readFileSync(PATHTOFILE, "utf-8");
    const chars = new antlr4.InputStream(input);
    const lexer = new JavaLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new JavaParser(tokens);

    const tree = parser.compilationUnit();

    const headers = [""];
    extractHeaders(tree, parser.ruleNames, headers, 0);
    if (headers[headers.length - 1] === "") {
        headers.pop();
    }

    const headerContent = headers.join("\n");
    fs.writeFileSync(HEADERFILE, headerContent);
    console.log(`Header file generated: ${HEADERFILE}`);
}

function extractHeaders(node, ruleNames, headers, depth) {
    
    const ruleName = ruleNames[node.ruleIndex];
    if (!ruleName) return;

    if (ruleName === "classOrInterfaceModifier") {
        const belongsTo = determineModifierContext(node, ruleNames);
        if (belongsTo === "class" || belongsTo === "method") {
            if(ruleNames[node.children[0].ruleIndex] === "annotation") {
                headers[headers.length - 1] += node.getText();
                headers.push(strMult("\t", depth));
            }
            else {
                headers[headers.length - 1] += node.getText() + " ";
            }
        } else {
            return;
        }
    } else if (
        ruleName === "classDeclaration" || 
        ruleName === "interfaceDeclaration"
    ) {
        for(let i = 0; i < node.children.length - 1; i++){
            headers[headers.length -1] += node.children[i].getText() + " ";
        }

        headers[headers.length -1] += "{";
        depth += 1;
        headers.push(strMult("\t", depth));

    } else if (
        ruleName === "methodDeclaration" || 
        ruleName === "constructorDeclaration" || 
        ruleName === "interfaceCommonBodyDeclaration"
    ) {
        if(isFromAnonymousClass(node, ruleNames)) return;

        for(let i = 0; i < node.children.length - 2; i++){
            headers[headers.length -1] += node.children[i].getText() + " ";
        }
        headers[headers.length -1] += "(" + methodVar(node.children[node.children.length-2].children[1]) + ");";
        
        headers.push(strMult("\t", depth));

    } else if (ruleName === "annotationTypeDeclaration"){ 
        headers[headers.length -1] += node.children[0].getText() + node.children[1].getText() + " ";
        for(let i = 2; i < node.children.length - 1; i++){
            headers[headers.length -1] += node.children[i].getText() + " ";
        }
        headers[headers.length -1] += "{";
        depth += 1;
        headers.push(strMult("\t", depth));

    } else if (ruleName === "annotationTypeElementRest"){
        headers[headers.length -1] += annotationTypeElementRek(node);
        headers.push(strMult("\t", depth));

    } else if (ruleName === "enumDeclaration"){
        for(let i = 0; i < node.children.length - 3; i++){
            headers[headers.length -1] += node.children[i].getText() + " ";
        }

        headers[headers.length -1] += "{";
        depth += 1;
        headers.push(strMult("\t", depth));
    } else if (ruleName === "enumConstants"){
        let enumconst = [];
        for(let i = 0; i < node.children.length; i++){
            if(i % 2 != 0) continue;
            enumconst.push(node.children[i].getText());
        }
        headers[headers.length-1] += enumconst.join(", ");
        headers.push(strMult("\t", depth));
    }

    for (const child of node.children || []) {
        extractHeaders(child, ruleNames, headers, depth);
    }

    if (ruleName === "classDeclaration" || ruleName === "interfaceDeclaration" || ruleName === "annotationTypeDeclaration" || ruleName === "enumDeclaration") {
        headers[headers.length-1] = strMult("\t", depth-1) + "}";
        headers.push(strMult("\t", depth-1));
    }
}

function methodVar(node){
    if(node.children === undefined) return "";
    var o = [];

    
    for(let i = 0; i < node.children.length; i++){
        if(i % 2 != 0) continue;
        const child = node.children[i];

        let opush = [];
        for(let j = 0; j < child.children.length; j++){
            opush.push(child.children[j].getText());
        }
        o.push(opush.join(" "));
    }

    return o.join(", ");

}

function strMult(str, times) {
    let o = "";
    for (let j = 0; j < times; j++) o += str;
    return o;
}

function determineModifierContext(node, ruleNames) {
    let context = node.parentCtx;

    if(ruleNames[node.parentCtx.parentCtx.ruleIndex] === "compilationUnit") return "class";
    if(isFromAnonymousClass(node, ruleNames)) return null;

    while (context) {
        const rule = ruleNames[context.ruleIndex];
        if (rule === "classBodyDeclaration") {
            const memberDeclaration = context.children.find(
                (child) => ruleNames[child.ruleIndex] === "memberDeclaration"
            );

            if (memberDeclaration) {
                const memberRule = ruleNames[memberDeclaration.children[0].ruleIndex];
                if (memberRule === "methodDeclaration") {
                    return "method";
                } else if (memberRule === "classDeclaration" || memberRule === "constructorDeclaration" || memberRule === "interfaceDeclaration" || memberRule === "enumDeclaration") {
                    return "class";
                } else if (memberRule === "fieldDeclaration") {
                    return "field";
                }
            }
        }

        context = context.parentCtx;
    }
    return null;
}

function isFromAnonymousClass(node, ruleNames){
    const findRule = "classBody";
    let context = node.parentCtx;

    while (context) {
        const rule = ruleNames[context.ruleIndex];
        if (rule === findRule) {
            break;
        }
        context = context.parentCtx;
    }

    if(context){
        return ruleNames[context.parentCtx.ruleIndex] === "classCreatorRest";
    }
    else {
        return true;
    }

}

function annotationTypeElementRek(node){
    if(node.children === undefined) {
        if(node.getText() === "(" || node.getText() === "[") return node.getText();
        return node.getText() + " ";
    }

    let o = "";
    for(const child of node.children){
        o += annotationTypeElementRek(child);
    }
    if(o.substring(o.length-2, o.length) === "; ") o = o.replace(" ; ", ";");
    return o;
}