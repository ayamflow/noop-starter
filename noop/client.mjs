var source
export function init(server) {
    server.get('/_dev', (req, res) => {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        })
        res.write('\n\n')

        source = res
    })
}

export function close() {
    // ¯\_(ツ)_/¯
}

export function reloadStyles() {
    if (!source) return

    send({
        type: 'style'
    })
}

export function showError(error) {
    if (!source) return

    send({
        type: 'error',
        error: {
            original: error,
            type: getType(error)
        }
    })
}

export function hideError() {
    if (!source) return

    send({
        type: 'hideerror'
    })
}

function send(event) {
    if (!source) return

    source.write(`data: ${JSON.stringify(event)}\n\n`)
}

function getType(object) {
    return object.constructor.toString().split('(')[0].replace('function ', '')
}