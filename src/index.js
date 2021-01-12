// Live-reload + error popup
if (process.env.NODE_ENV == 'dev') {
    import('./_dev/client')
}
import './style/index.css'

console.log('it starts here!')