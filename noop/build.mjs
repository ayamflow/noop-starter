import * as utils from './utils.mjs'
import esbuild from 'esbuild'
import { log } from './log.mjs'
import { styles } from './styles.mjs'

export function build(options = {}) {
    utils.setup('production')

    return esbuild.build(getParams(options)).then(async () => {
        await utils.gzip()
        utils.filesize()
    })
}

export function watch(options = {}) {
    const port = options.port || 8000
    if (options.port) delete options.port

    setup('dev', port)

    return esbuild.serve({ port }, getParams(options))
        .then(server => {
            process.on('SIGINT', function () {
                server.stop()
                log('\nesbuild server stopped.')
                process.exit()
            })

            log(`esbuild server started`)
        })
        // .catch(() => process.exit(1))
}

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