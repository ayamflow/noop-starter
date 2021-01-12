import './client.css'

var source = new EventSource('/_dev')
var errorEl = null

source.onmessage = function(event) {
    let data = JSON.parse(event.data)
    // console.log(`[noop] Received server event "${data.type}"`)

    switch(data.type) {
        case 'style': return reloadStyles()
        case 'error': return showError(data.error)
        case 'hideerror': return hideError()
    }
}

function reloadStyles() {
    let stylesheet = document.querySelector('link[rel=stylesheet]')
    let href = stylesheet.getAttribute('href')
    href = href.split('?')[0]
    href += `?time=${Date.now()}`
    stylesheet.setAttribute('href', href)
    // console.log(`[noop] bundle.css reloaded! ${new Date(Date.now())}`)
}

function showError(error) {
    let data = error.original.errors[0]
    hideError()
    initError(data, error.type)
}

function hideError() {
    if (errorEl && errorEl.parentNode) errorEl.parentNode.removeChild(errorEl)
}

function initError(error, type) {
    let line = `${error.location.lineText.slice(0, error.location.column)}<em>${error.location.lineText.slice(error.location.column, error.location.column + error.location.length)}</em>${error.location.lineText.slice(error.location.column + error.location.length)}`

    let el = document.createElement('div')
    el.classList.add('dev-error')
    el.innerHTML = `
        <div class="wrapper">
            <div class="type"> ${type}</div>
            <div class="file"> > ${error.location.file} line ${error.location.line}, column ${error.location.column}</div>
            <br/><br/>
            <div class="text"> ${error.text}</div>
            <div class="code">
                ...<br/><br/>
                <span>${error.location.line}|</span> &nbsp;&nbsp;&nbsp;${line}
                <br/><br/>...
            </div>
        </div>
    `
    document.body.appendChild(el)
    errorEl = document.querySelector('.dev-error')
}