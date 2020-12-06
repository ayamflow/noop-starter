import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import normalize from 'postcss-normalize'
import nested from 'postcss-nested'
import fs from 'fs'

export function styles() {
    return {
        name: 'esbuild-postcss',
        setup(build) {
            build.onLoad({ filter: /\.css/ }, async args => {
                let contents = await fs.promises.readFile(args.path, 'utf8')
                let result = await postcss([
                    autoprefixer,
                    nested,
                    normalize
                ])
                .process(contents, { from: args.path })
                contents = result.css

                return {
                    contents,
                    loader: 'css'
                }
            })
        }
    }
}