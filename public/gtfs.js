import fetch from 'node-fetch'
import JSZip from 'jszip'
import L from 'leaflet'

// Initialize the map
const map = L.map('map').setView([-43.532, 172.6306], 12) // Set the initial view to Christchurch

// Add a tile layer (e.g., OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(map)

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

        // Create polylines for each route on the map
        routes.forEach((route) => {
            const coordinates = route.shape_pt_lat
                .split(',')
                .map((lat, index) => [
                    parseFloat(lat),
                    parseFloat(route.shape_pt_lon.split(',')[index]),
                ])

            const polyline = L.polyline(coordinates, {
                color: `#${route.route_color}`,
                weight: 3,
                opacity: 0.7,
            }).addTo(map)

            polyline.bindPopup(
                `<b>${route.route_short_name}</b><br>${route.route_long_name}`
            )
        })
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
