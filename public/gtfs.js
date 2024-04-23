import fetch from 'node-fetch'
import JSZip from 'jszip'

fetch('https://apis.metroinfo.co.nz/rti/gtfs/v1/gtfs.zip', {
    method: 'GET',
    headers: {
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': 'adabce10d57a4f1781a193946e405946',
    },
})
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
        const zip = new JSZip()
        return zip.loadAsync(arrayBuffer)
    })
    .then((zip) => {
        return zip.file('routes.txt').async('string')
    })
    .then((routesData) => {
        const routes = parseCSV(routesData)
        console.log(routes)
    })
    .catch((err) => console.error(err))

function parseCSV(csvData) {
    const lines = csvData.split('\n')
    const headers = lines[0].split(',')
    const routes = []

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        if (values.length === headers.length) {
            const route = {}
            for (let j = 0; j < headers.length; j++) {
                route[headers[j]] = values[j]
            }
            routes.push(route)
        }
    }

    return routes
}
