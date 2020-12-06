import * as utils from './utils.mjs'
import esbuild from 'esbuild'
import { styles } from './styles.mjs'

export function build(options = {}) {
    setup('production')

    return esbuild.build(getParams(options))
}

export function watch(options = {}) {
    const port = options.port || 8000
    if (options.port) delete options.port

    setup('dev', port)

    return esbuild.serve({ port }, getParams(options))
        .then(server => {
            process.on('SIGINT', function () {
                server.stop()
                console.log('\n[noop] esbuild server stopped.');
                process.exit()
            })

            console.log(`[noop] esbuild server started on http://localhost:${port}`);
        })
        // .catch(() => process.exit(1))
}

function setup(env, port) {
    utils.clean('static')
    // utils.copyAssets('static')
    utils.templateHtml('static', port)
}

function getParams(options) {
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