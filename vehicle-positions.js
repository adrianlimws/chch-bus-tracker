import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import fetch from 'node-fetch'

fetch('https://apis.metroinfo.co.nz/rti/gtfsrt/v1/vehicle-positions.pb', {
    method: 'GET',
    headers: {
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': 'adabce10d57a4f1781a193946e405946',
    },
})
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
        // Decode the protobuf message
        var feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
            new Uint8Array(buffer)
        )

        // Get the vehicle positions from the feed
        var vehiclePositions = feed.entity

        // Display the vehicle positions
        vehiclePositions.forEach(function (entity) {
            var vehicle = entity.vehicle
            var position = vehicle.position

            console.log('Vehicle ID:', vehicle.vehicle.id)
            console.log('Latitude:', position.latitude)
            console.log('Longitude:', position.longitude)
            console.log('-----')
        })
    })
    .catch((err) => console.error(err))
