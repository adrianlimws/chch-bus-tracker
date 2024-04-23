const map = L.map('map').setView([-43.532, 172.6362], 13)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map)

const busIcon = L.icon({
    iconUrl: 'bus-icon.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
})

let markers = []

function updateVehiclePositions() {
    fetch('/vehicle-positions')
        .then((response) => response.json())
        .then((data) => {
            // Remove existing markers from the map
            markers.forEach((marker) => marker.remove())
            markers = []

            // Add new markers for the updated vehicle positions
            data.forEach((entity) => {
                const vehicle = entity.vehicle
                const position = vehicle.position
                const marker = L.marker(
                    [position.latitude, position.longitude],
                    { icon: busIcon }
                ).addTo(map)
                marker.bindPopup(`Vehicle ID: ${vehicle.vehicle.id}`)
                markers.push(marker)
            })
        })
        .catch((err) => console.error(err))
}

// Update vehicle positions every 3 seconds
setInterval(updateVehiclePositions, 3000)

Promise.all([fetchStops(), fetchRoutes()])
    .then(([stops, routes]) => {
        console.log('Stops:', stops)
        console.log('Routes:', routes)

        // Create markers for each stop on the map
        stops.forEach((stop) => {
            const marker = L.circleMarker([stop.stop_lat, stop.stop_lon], {
                color: 'blue',
                fillColor: 'blue',
                fillOpacity: 1,
                radius: 4,
            }).addTo(map)

            // Attach a popup to the marker
            marker.bindPopup(`<b>${stop.stop_name}</b><br>${stop.stop_desc}`)
        })

        // Connect the stops for each route with lines
        routes.forEach((route) => {
            const routeColor = `#${route.route_color}`

            // Filter the stops for the current route
            const routeStops = stops.filter((stop) =>
                stop.stop_id.startsWith(route.route_id)
            )

            // Extract the coordinates of the route's stops
            const coordinates = routeStops.map((stop) => [
                stop.stop_lat,
                stop.stop_lon,
            ])

            // Create a polyline connecting the route's stops
            const polyline = L.polyline(coordinates, {
                color: routeColor,
                weight: 3,
                opacity: 0.7,
            }).addTo(map)

            // Attach a popup to the polyline
            polyline.bindPopup(
                `<b>${route.route_short_name}</b><br>${route.route_long_name}`
            )
        })
    })
    .catch((err) => console.error(err))

// Function to fetch and parse the stops.txt file
function fetchStops() {
    return fetch('https://apis.metroinfo.co.nz/rti/gtfs/v1/gtfs.zip')
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
            const zip = new JSZip()
            return zip.loadAsync(arrayBuffer)
        })
        .then((zip) => {
            return zip.file('stops.txt').async('string')
        })
        .then((stopsData) => {
            return parseCSV(stopsData)
        })
}

// Function to fetch and parse the routes.txt file
function fetchRoutes() {
    return fetch('https://apis.metroinfo.co.nz/rti/gtfs/v1/gtfs.zip')
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
            const zip = new JSZip()
            return zip.loadAsync(arrayBuffer)
        })
        .then((zip) => {
            return zip.file('routes.txt').async('string')
        })
        .then((routesData) => {
            return parseCSV(routesData)
        })
}

function parseCSV(csvData) {
    const lines = csvData.split('\n')
    const headers = lines[0].split(',')
    const data = []

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        if (values.length === headers.length) {
            const row = {}
            for (let j = 0; j < headers.length; j++) {
                row[headers[j]] = values[j]
            }
            data.push(row)
        }
    }

    return data
}
