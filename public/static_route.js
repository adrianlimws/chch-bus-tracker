let routesData = []
let tripsData = []
let shapesData = []

function fetchGtfsStaticData() {
    fetch('/gtfs-static')
        .then((response) => response.json())
        .then((data) => {
            routesData = data.routes
            tripsData = data.trips
            shapesData = data.shapes
            drawRoutes()
        })
        .catch((err) => console.error(err))
}

function drawRoutes() {
    routesData.forEach((route) => {
        const routeId = route.route_id
        const routeColor = route.route_color

        const routeShapes = shapesData.filter(
            (shape) => shape.shape_id === routeId
        )
        const routeCoordinates = routeShapes.map((shape) => [
            parseFloat(shape.shape_pt_lat),
            parseFloat(shape.shape_pt_lon),
        ])

        const polyline = L.polyline(routeCoordinates, {
            color: `#${routeColor}`,
        }).addTo(map)
    })
}

function updateVehiclePositions() {
    fetch('/vehicle-positions')
        .then((response) => response.json())
        .then((data) => {
            // ... (Keep the existing marker removal code)

            data.forEach((entity) => {
                const vehicle = entity.vehicle
                const position = vehicle.position
                const tripId = vehicle.trip.trip_id
                const routeId = tripsData.find(
                    (trip) => trip.trip_id === tripId
                ).route_id
                const route = routesData.find(
                    (route) => route.route_id === routeId
                )

                const marker = L.marker(
                    [position.latitude, position.longitude],
                    { icon: busIcon }
                ).addTo(map)
                marker.bindPopup(
                    `Vehicle ID: ${vehicle.vehicle.id}<br>Route: ${route.route_short_name}`
                )
                markers.push(marker)
            })
        })
        .catch((err) => console.error(err))
}

fetchGtfsStaticData()
