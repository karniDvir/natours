export const displayMap = (locations) => {
  // Create the map centered at first location
  const map = L.map('map');

  // Add OSM tiles
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 12,
    attribution: '&copy; OpenStreetMap contributors',
    zoomControl: false,
    interactive: true
  }).addTo(map);

  // Fit bounds to all markers
  const bounds = new L.LatLngBounds();

  locations.forEach(loc => {
    const [lng, lat] = loc.coordinates; // GeoJSON is [lng, lat]
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`<strong>${loc.description}</strong><br>Day ${loc.day}`);
    bounds.extend([lat, lng]);
  });

  L.Icon.Default.mergeOptions({
    iconUrl: 'marker-icon.png',
    iconRetinaUrl: 'marker-icon-2x.png',
    shadowUrl: 'marker-shadow.png'
  });
  map.fitBounds(bounds);
}
