import fs from 'fs'
import path from 'path'
import childProcess from 'child_process'
import zlib from 'zlib'
import CheapWatch from 'cheap-watch'
import kleur from 'kleur'
import { log, error, warning } from './log.mjs'

const watchers = []

export function setup(env) {
    clean('static')
    copyAssets('static', {watch: env == 'dev'})
    templateHtml('static')
}

function getHour(date) {
    return `
        ${date.getHours()}
        :
        ${date.getMinutes().toString().padStart(2, 0)}
        :
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
        error('You need at least 1 commit to build');
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
    fs.rmSync(path, { recursive: true, force: true })
    childProcess.execSync(`mkdir ${path}`).toString()
}

/*
    copyAssets
    copy the source assets to the output fodler
    - dest {string} the output fodler
*/
export async function copyAssets(dest, options = {}) {
    const src = './assets'
    childProcess.execSync(`cp -rf ${src} ${dest}/assets`).toString()

    if (options.watch) {
        const watcher = new CheapWatch({
            dir: path.resolve(src),
            filter: ({path}) => {
                return path != 'assets' && !path.match(/(^|[\/\\])\../)
            }
        })
        watchers.push(watcher)
        await watcher.init()
        log(`${kleur.underline('Watching')} ${kleur.yellow(src)} folder`)

        watcher.on('+', event => {
            let time = getHour(new Date(Date.now()))
            log(`${event.isNew ? 'add' : 'update'} ${kleur.yellow(path.join(src, event.path))} ${kleur.blue('(' + time + ')')}`)
            childProcess.execSync(`cp -rf ${path.join(src, event.path)} ${dest}/assets`).toString()
        })
        watcher.on('-', event => {
            let time = getHour(new Date(Date.now()))
            log(`remove ${kleur.yellow(path.join(src, event.path))} ${kleur.blue('(' + time + ')')}`)
            childProcess.execSync(`rm -rf ${path.join(dest, src, event.path)}`).toString()
        })
    }
}

export async function watch(folder) {
    const watcher = new CheapWatch({ dir: path.resolve(folder) })
    await watcher.init()
    watchers.push(watcher)
    return watcher
}

export function stopWatch() {
    watchers.forEach(watcher => watcher.close())
}

/*
    copyHtml
    copy the index.html template
    - dest {string} the output fodler
*/
export function templateHtml(dest) {
    let file = fs.readFileSync('index.html', 'utf8')
    file = file.replace('{{script}}', `./bundle.js`)
    file = file.replace('{{styles}}', `./bundle.css`)
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
    
    for (let size in sizes) {
        warning(`${size}: ${sizes[size]}`)
    }
}