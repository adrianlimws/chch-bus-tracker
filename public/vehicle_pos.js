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
