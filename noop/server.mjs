import polka from 'polka'
import useStatic from 'use-static'
import path from 'path'
import { log } from './log.mjs'
const dir = path.join(path.resolve(), './static')

export function serve({ port = 3000 }) {
    polka().use(useStatic(dir)).listen(port, error => {
        if (error) throw error
        log(`Serving files on http://localhost:${port}`)
    })
}