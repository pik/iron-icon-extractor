#!/usr/bin/env node

const fs = require('fs')
const parse5 = require('parse5')
const adapter = parse5.treeAdapters.default


getElementById = function (node, id) {
    matchFunc = function(node) {
        return node.attrs && node.attrs.some((attr) => {
            return attr.name === "id" && attr.value === id
        })
    }
    return getElements(node, matchFunc)
}

outerHTML = function(node) {
    const wrapper = adapter.createDocumentFragment()
    adapter.appendChild(wrapper, node)
    return parse5.serialize(wrapper)
}

getElementsByName = function (node, name) {
    matchFunc = function(node) {
        return node.nodeName === name
    }
    return getElements(node, matchFunc)
}

getElements = function(topNode, matchFunc, elements) {
    if (!elements) elements = []
    let nodes = Array.isArray(topNode) ? topNode : [topNode]
    for (let node of nodes) {
        if (matchFunc(node)) {
            elements.push(node)
        } else if (node.childNodes && node.childNodes.length) {
            getElements(node.childNodes, matchFunc, elements)
        }
    }
    return elements
}

process.on("uncaughtException", function(err) {
    process.stderr.write(err.message);
    process.stderr.write(err.stack);
    process.exit(1);
});

getElementId = function(node) {
    if (!node.attrs) return
    for (let attr of node.attrs) {
        if (attr.name === "id") {
            return attr.value
        }
    }
}

parseArgs = function() {
    const opts = {}
    const argv = process.argv
    const nameIndex = argv.indexOf('--name')
    opts.iconSetName = nameIndex !== -1 ? argv.splice(nameIndex, 2)[1].trim() : 'myName'
    const sizeIndex = argv.indexOf('--size')
    opts.iconSetSize = sizeIndex !== -1 ? argv.splice(sizeIndex, 2)[1].trim() : 24
    const outIndex = argv.indexOf('--out')
    opts.outPath = outIndex !== -1 ? argv.splice(outIndex, 2)[1].trim() : null
    opts.selectedIconNames = argv.slice(2)
    return opts
}

setHTMLAttr = function (node, attrName, value) {
    for (let attr of node.attrs) {
        if (attr.name === attrName) {
            attr.value = value
            return true
        }
    }
}

generateSelectedIconSet = function(ironIconsText) {
    const header = '<link rel="import" href="../bower_components/iron-icon/iron-icon.html">\n' +
        '<link rel="import" href="../bower_components/iron-iconset-svg/iron-iconset-svg.html">\n'
    const opts = parseArgs()
    const selectedIconNames = opts.selectedIconNames
    const page = parse5.parse(ironIconsText)
    const defs = getElementsByName(page, 'defs')[0]
    const selectedIconsHTML = defs.childNodes.filter((node) => {
        return (selectedIconNames.indexOf(getElementId(node)) !== -1)
    })
    const wrapper = adapter.createDocumentFragment()
    defs.childNodes = selectedIconsHTML

    const ironIconSet = getElementsByName(page, 'iron-iconset-svg')[0]
    setHTMLAttr(ironIconSet, 'name', opts.iconSetName)
    setHTMLAttr(ironIconSet, 'size', opts.iconSetSize.toString())
    adapter.appendChild(wrapper, ironIconSet)

    const output = header + parse5.serialize(wrapper)
    if (opts.outPath) {
        fs.writeFile(opts.outPath, output)
    } else {
        process.stdout.write(output)
    }
}

fs.readFile('./bower_components/iron-icons/iron-icons.html', 'utf8', function (err,data) {
    generateSelectedIconSet(data)
})


