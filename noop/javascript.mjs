import esbuild from 'esbuild'

export function build(options = {}) {
    let env = setEnvironment(options)

    esbuild.build(Object.assign({
        entryPoints: ['src/index.js'],
        bundle: true,
        outfile: 'static/bundle.js',
        banner: `### built with noop-starter`,
    }, env, options)).catch(() => process.exit(1))
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