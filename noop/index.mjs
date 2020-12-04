import { build as js } from './javascript.mjs'

let cmd = process.argv.slice(2)

if (cmd.indexOf('--watch') > -1) watch()
else build()

function build() {
    js({
        env: 'prod',
        minify: true
    })
}

function watch() {
    let result = js({
        env: 'dev',
        sourcemap: true,
        serve: true,
        color: true,
        incremental: true
    })

    // TODO 
    result.rebuild()
}