import polka from 'polka'
import useStatic from 'use-static'
import path from 'path'
const dir = path.join(path.resolve(), './static')

export function serve({ port = 3000 }) {
    polka().use(useStatic(dir)).listen(port, error => {
        if (error) throw error
        console.log(`[noop] Serving files on http://localhost:${port}`)
    })
}