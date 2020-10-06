export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiamEtYWxvbnNvLW1hcCIsImEiOiJja2ZpbHZvam8wNmg4MnFrdHIyc3Q5YjVhIn0.zSOmPwe1r1AJTirQ6DAURQ';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/ja-alonso-map/ckfio2m7217471as5xir1az6u',
        scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        const markerPoint = document.createElement('div');
        markerPoint.className = 'marker';

        new mapboxgl.Marker({
            element: markerPoint,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        new mapboxgl
                    .Popup({
                        offset: 35
                    })
                    .setLngLat(loc.coordinates)
                    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
                    .addTo(map);

        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}