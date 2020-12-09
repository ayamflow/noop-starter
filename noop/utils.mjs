import fs from 'fs'
import path from 'path'
import childProcess from 'child_process'
import zlib from 'zlib'
import chokidar from 'chokidar'

function getHour(date) {
    return `
        ${date.getHours()}
        h
        ${date.getMinutes().toString().padStart(2, 0)}
        m
        ${date.getSeconds().toString().padStart(2, 0)}
    `.replace(/\n/g, '').replace(/\ /g, '')
}

/*
    getVersion
    Generates a unique version string based on
    time and git commits number
*/
export function getVersion() {
    let version = 0
    try {
        version = childProcess.execSync('git rev-list HEAD --count').toString()
    } catch(e) {
        console.log('[noop] You need at least 1 commit to build');
    }
    let date = new Date(Date.now())
    
    let day = `
        ${date.getDate().toString().padStart(2, 0)}
        /
        ${date.getMonth() + 1}
        /
        ${date.getFullYear()}
    `.replace(/\n/g, '').replace(/\ /g, '')

    let time = getHour(date)

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
export function copyAssets(dest, options = {}) {
    childProcess.execSync(`cp -rf assets ${dest}/assets`).toString()

    if (options.watch) {
        console.log('[noo] Watching ./assets folder');
        chokidar.watch('./assets', {
            ignored: /(^|[\/\\])\../,
        }).on('all', (event, path) => {
            let time = getHour(new Date(Date.now()))
            console.log(`[noop] ${event} ${path} (${time})`)
            childProcess.execSync(`cp -rf ${path} ${dest}/assets`).toString()
        })
    }
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

export function gzip() {
    const path = './static/bundle.js'
    const file = fs.createReadStream(path)
    const stream = fs.createWriteStream(path.replace('.js', '.js.gz'))
    const zip = zlib.createGzip()
    return new Promise((resolve, reject) => {
        file.pipe(zip).pipe(stream).on('finish', (err) => {
          if (err) return reject(err)
          else resolve()
        })
    })
}

export async function filesize() {
    const dir = './static'
    let sizes = {}
    let files = await fs.promises.readdir(dir)
    await Promise.all(files.map(async file => {
        let stats = await fs.promises.stat(path.join(dir, file))
        let i = Math.floor(Math.log(stats.size) / Math.log(1024))
        let suffix = ['B', 'KB', 'MB', 'GB', 'TB'][i]
        let size = (stats.size / Math.pow(1024, i)).toString()
        let index = size.indexOf('.')
        if (index > -1) {
            sizes[file] = `${size.slice(0, index + 3)}${suffix}`
        } else {
            sizes[file] = `${size}${suffix}`
        }
    }))
    console.log(sizes)
}