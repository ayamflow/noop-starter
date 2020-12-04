import { build, watch } from './build.mjs'

let cmd = process.argv.slice(2)

if (cmd.indexOf('--watch') > -1) dev()
else prod()

function prod() {
    build({
        env: 'prod',
        minify: true
    })
}

function dev() {
    watch({
        env: 'dev',
        sourcemap: true,
        color: true,
        incremental: true
    })
}