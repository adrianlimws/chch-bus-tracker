import pkg from 'gtfs-realtime-bindings'
const { transit_realtime } = pkg
import fetch from 'node-fetch'
import express from 'express'
import path from 'path'

const app = express()
const port = 3000

app.get('/vehicle-positions', async (req, res) => {
    try {
        const response = await fetch(
            'https://apis.metroinfo.co.nz/rti/gtfsrt/v1/vehicle-positions.pb',
            {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Ocp-Apim-Subscription-Key':
                        'adabce10d57a4f1781a193946e405946',
                },
            }
        )
        const buffer = await response.arrayBuffer()
        const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer))
        const vehiclePositions = feed.entity
        res.json(vehiclePositions)
    } catch (err) {
        console.error(err)
        res.status(500).send('Error fetching vehicle positions')
    }
})

app.use(express.static(path.join(process.cwd(), 'public')))

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
