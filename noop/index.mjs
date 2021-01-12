import { build, watch } from './build.mjs'

let cmd = process.argv.slice(2)

if (cmd.indexOf('--watch') > -1) dev()
else prod()

function prod() {
    build({
        env: 'production',
        minify: true
    })
}

function dev() {
    watch({
        port: 3000,
        env: 'dev',
        sourcemap: true,
        color: true,
        incremental: true
    })
}