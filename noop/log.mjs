import kleur from 'kleur'

export function log(content) {
    let prefix = kleur.bold().white('[noop]')
    console.log(`${prefix} ${content}`)
}

export function warning(content) {
    log(kleur.italic().yellow(content))
}

export function error(content) {
    log(kleur.bold().red(content))
}