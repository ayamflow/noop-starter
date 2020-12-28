import polka from 'polka'
import sirv from 'sirv'
import path from 'path'
import { log } from './log.mjs'
import kleur from 'kleur'
const dir = path.join(path.resolve(), './static')

export function serve({ port = 3000 }) {
    polka()
    .use(sirv(dir, {single: true})).listen(port, error => {
        if (error) throw error
        let localhost = `http://localhost:${port}`
        log(`${kleur.underline('Serving')} files on ${kleur.yellow(localhost)}`)
    })
}