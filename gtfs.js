fetch('https://apis.metroinfo.co.nz/rti/gtfs/v1/gtfs.zip', {
    method: 'GET',
    // Request headers
    headers: {
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': 'adabce10d57a4f1781a193946e405946',
    },
})
    .then((response) => {
        console.log(response.status)
        console.log(response.text())
    })
    .catch((err) => console.error(err))
