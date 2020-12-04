import esbuild from 'esbuild'
import childProcess from 'child_process'

export function build(options = {}) {
    let env = setEnvironment(options)
    let version = getVersion()

    esbuild.build(Object.assign({
        entryPoints: ['src/index.js'],
        bundle: true,
        outfile: 'static/bundle.js',
        banner: `// noop build ${version}`,
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

function getVersion() {
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