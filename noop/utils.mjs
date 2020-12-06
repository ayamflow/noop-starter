import fs from 'fs'
import childProcess from 'child_process'

/*
    getVersion
    Generates a unique version string based on
    time and git commits number
*/
export function getVersion() {
    let version = childProcess.execSync('git rev-list HEAD --count').toString()
    let date = new Date(Date.now())
    
    let day = `
        ${date.getDate().toString().padStart(2, 0)}
        /
        ${date.getMonth() + 1}
        /
        ${date.getFullYear()}
    `.replace(/\n/g, '').replace(/\ /g, '')

    let time = `
        ${date.getHours()}
        h
        ${date.getMinutes().toString().padStart(2, 0)}
        m
        ${date.getSeconds().toString().padStart(2, 0)}
    `.replace(/\n/g, '').replace(/\ /g, '')

    return `${version}. (${day} ${time})`.replace(/\n/g, '')
}

/*
    clean
    completely empties a folder, recursively
    - path {string} the folder path to clean
*/
export function clean(path) {
    fs.rmdirSync(path, { recursive: true })
    childProcess.execSync(`mkdir ${path}`).toString()
}

/*
    copyAssets
    copy the source assets to the output fodler
    - dest {string} the output fodler
*/
export function copyAssets(dest) {
    childProcess.execSync(`cp -rf assets ${dest}/assets`).toString()
}

/*
    copyHtml
    copy the index.html template
    - dest {string} the output fodler
*/
export function templateHtml(dest, port) {
    // childProcess.execSync(`cp index.html ${dest}/index.html`).toString()

    let file = fs.readFileSync('index.html', 'utf8')
    if (port) {
        file = file.replace('{{script}}', `http://localhost:${port}/index.js`)
        file = file.replace('{{styles}}', `http://localhost:${port}/index.css`)
    } else {
        file = file.replace('{{script}}', `./bundle.js`)
        file = file.replace('{{script}}', `./bundle.css`)
    }
    fs.writeFileSync(`${dest}/index.html`, file)
}