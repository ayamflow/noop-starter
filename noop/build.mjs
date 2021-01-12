import * as utils from './utils.mjs'
import * as client from './client.mjs'
import { serve } from './server.mjs'
import esbuild from 'esbuild'
import kleur from 'kleur'
import { log } from './log.mjs'
import { styles } from './styles.mjs'

export function build(options = {}) {
    utils.setup('production')

    return esbuild.build(getParams(options)).then(async () => {
        await utils.gzip()
        utils.filesize()
    })
}

export async function watch(options = {}) {
    const port = options.port
    const server = serve({ port })
    const params = getParams(options)
    
    function rebuild() {
        return esbuild.build(params)
        .then(() => {
            client.hideError()
        })
        .catch(error => {
            client.showError(error)
        })
    }
    
    utils.setup('dev')
    client.init(server)
    await rebuild()
    
    const watcher = await utils.watch('./src')
    watcher.on('+', async event => {
        if (!event.path.match(/(.js)|(.css)/)) return

        log(`code change: ${event.path}`)
        
        await rebuild()
        if (event.path.includes('.css')) client.reloadStyles()
    })
    
    process.on('SIGINT', function () {
        utils.stopWatch()
        console.log('\n')
        log(`Stopped server (${kleur.underline('Watching')}/${kleur.underline('Serving')}). Bye!`)
        console.log('\n')
        client.close()
        process.exit()
    })
}

function getParams(options) {
    if (options.port) delete options.port
    let env = setEnvironment(options)
    let version = utils.getVersion()
    
    return Object.assign({
        entryPoints: ['src/index.js'],
        bundle: true,
        loader: {
            '.svg': 'file',
            '.json': 'file',
            '.jpg': 'file',
            '.gif': 'file',
            '.png': 'file'
        },
        outfile: 'static/bundle.js',
        banner: `// noop build ${version}`,
        plugins: [styles()]
    }, env, options)
}

function setEnvironment(options) {
    if (!options.env) options.env = 'production'
    let env = {
        define: {
            'process.env.NODE_ENV': `\"${options.env}\"`
        }
    }

    delete options.env
    return env
}