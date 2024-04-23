import pkg from 'gtfs-realtime-bindings'
const { transit_realtime } = pkg
import fetch from 'node-fetch'
import express from 'express'
import path from 'path'
import AdmZip from 'adm-zip'

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

app.get('/gtfs-static', async (req, res) => {
    try {
        const response = await fetch(
            'https://apis.metroinfo.co.nz/rti/gtfs/v1/gtfs.zip',
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
        const zip = new AdmZip(Buffer.from(buffer))
        const routesData = zip.readAsText('routes.txt')
        const tripsData = zip.readAsText('trips.txt')
        const shapesData = zip.readAsText('shapes.txt')

        const parsedRoutesData = parseCSV(routesData)
        const parsedTripsData = parseCSV(tripsData)
        const parsedShapesData = parseCSV(shapesData)

        res.json({
            routes: parsedRoutesData,
            trips: parsedTripsData,
            shapes: parsedShapesData,
        })
    } catch (err) {
        console.error(err)
        res.status(500).send('Error fetching GTFS static data')
    }
})

function parseCSV(csvData) {
    const lines = csvData.split('\n')
    const headers = lines[0].split(',')
    const data = []

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        const obj = {}
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = values[j]
        }
        data.push(obj)
    }

    return data
}

app.use(express.static(path.join(process.cwd(), 'public')))

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
