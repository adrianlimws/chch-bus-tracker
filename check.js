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
        // Get the list of files in the ZIP file
        const fileNames = Object.keys(zip.files)
        console.log('Files in the GTFS dataset:', fileNames)

        // Check if shapes.txt exists in the ZIP file
        if (fileNames.includes('shapes.txt')) {
            console.log('shapes.txt file exists in the GTFS dataset.')
        } else {
            console.warn('shapes.txt file does not exist in the GTFS dataset.')
        }

        return zip.file('routes.txt').async('string')
    })
    .then((routesData) => {
        const routes = parseCSV(routesData)
        console.log(routes)

        // ... (rest of the code remains the same)
    })
    .catch((err) => console.error(err))

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
