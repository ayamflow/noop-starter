import utils from './utils.mjs'
import esbuild from 'esbuild'

export function build(options = {}) {
    setup()

    return esbuild.buildSync(getParams(options))
}

export function watch(options = {}) {
    setup()

    const port = options.port || 8000
    if (options.port) delete options.port

    return esbuild.serve({ port }, getParams(options))
        .then(server => {
            process.on('SIGINT', function () {
                server.stop()
                console.log('\n[noop] Dev server ended.');
                process.exit()
            })

            console.log(`[noop] Dev server started on http://localhost:${port}`);
        })
        .catch(() => process.exit(1))
}

function setup() {
    utils.clean('static')
    // utils.copyAssets('static')
    utils.copyHtml('static')
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
    }, env, options)
}

function setEnvironment(options) {
    if (!options.env) options.env = 'prod'
    let env = {
        define: {
            'process.env.NODE_ENV': `\"${options.env}\"`
        }
    }

    delete options.env
    return env
}