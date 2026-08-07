// City-center latitude/longitude for the estate's municipalities.
// Used by schemaLocalbusiness() (lib/schema.ts) to add GeoCoordinates to the
// LocalBusiness JSON-LD — the per-site configs carry no coordinates, so without
// this map every site's LocalBusiness omits geo (a local-SEO gap flagged in the
// 2026-07-25 duplicate-content/SEO audit).
//
// Coordinates verified July 2026 against Natural Resources Canada "Geographical
// Names of Canada", Wikipedia infobox coordinates, OSM Nominatim, and
// latlong.net / latitude.to, cross-checked across at least two sources each.
// These are community / city CENTERS (km-level precision) — appropriate for a
// LocalBusiness geo signal, NOT pin-point address geocoding. A city/region not
// present here simply gets no GeoCoordinates (schemaLocalbusiness emits geo
// only on match), so this map is strictly additive and never degrades a site.
//
// Two values that contradict naive expectations, confirmed by multi-source lookup:
//   - Forest:        -82.0003 (not ~-82.19; 3 independent sources agree)
//   - Sarnia:        -82.4035 (Wikipedia infobox's -82.32 is ~8km too far east;
//                              OSM + the city's St. Clair River location = -82.40)

export interface Geo {
  lat: number;
  lng: number;
}

export const CITY_GEO: Record<string, Geo> = {
  Ajax: { lat: 43.8508, lng: -79.0208 },
  Amherstburg: { lat: 42.1, lng: -83.083 },
  Ancaster: { lat: 43.2181, lng: -79.9872 },
  Aurora: { lat: 44.0065, lng: -79.4504 },
  Aylmer: { lat: 42.7729, lng: -80.9829 },
  Ayr: { lat: 43.286, lng: -80.453 },
  Bayfield: { lat: 43.56, lng: -81.6992 },
  Blyth: { lat: 43.7176, lng: -81.3744 },
  Brantford: { lat: 43.1394, lng: -80.2644 },
  Burlington: { lat: 43.3255, lng: -79.799 },
  Caledonia: { lat: 43.0648, lng: -79.9551 },
  Cambridge: { lat: 43.3616, lng: -80.3146 },
  Chatham: { lat: 42.4047, lng: -82.1837 },
  Clinton: { lat: 43.6159, lng: -81.5394 },
  Dorchester: { lat: 43.0219, lng: -81.0806 },
  Dunnville: { lat: 42.9059, lng: -79.6189 },
  Elmira: { lat: 43.5996, lng: -80.5583 },
  Exeter: { lat: 43.3472, lng: -81.4806 },
  Forest: { lat: 43.1008, lng: -82.0003 },
  Georgetown: { lat: 43.6502, lng: -79.9036 },
  Glencoe: { lat: 42.7464, lng: -81.7089 },
  Goderich: { lat: 43.7483, lng: -81.71 },
  'Grand Bend': { lat: 43.3172, lng: -81.75 },
  Guelph: { lat: 43.5468, lng: -80.2482 },
  Hamilton: { lat: 43.2557, lng: -79.8711 },
  'Huron County': { lat: 43.667, lng: -81.4 },
  Ilderton: { lat: 43.0787, lng: -81.3834 },
  Ingersoll: { lat: 43.0382, lng: -80.884 },
  Keswick: { lat: 44.2436, lng: -79.4758 },
  Kitchener: { lat: 43.4516, lng: -80.4925 },
  Komoka: { lat: 42.9486, lng: -81.4361 },
  LaSalle: { lat: 42.2253, lng: -83.0481 },
  Lakeshore: { lat: 42.2932, lng: -82.7117 },
  Leamington: { lat: 42.067, lng: -82.583 },
  Listowel: { lat: 43.7317, lng: -80.9536 },
  London: { lat: 42.9849, lng: -81.2453 },
  Lucan: { lat: 43.1868, lng: -81.4093 },
  Markham: { lat: 43.8767, lng: -79.2633 },
  Milton: { lat: 43.5183, lng: -79.8858 },
  Mitchell: { lat: 43.468, lng: -81.198 },
  'Mount Brydges': { lat: 42.9085, lng: -81.4952 },
  Nanticoke: { lat: 42.8091, lng: -80.0823 },
  Newmarket: { lat: 44.0514, lng: -79.4611 },
  Norfolk: { lat: 42.8334, lng: -80.383 },
  Oakville: { lat: 43.4675, lng: -79.6877 },
  Oshawa: { lat: 43.899, lng: -78.8658 },
  'Owen Sound': { lat: 44.5667, lng: -80.9333 },
  Paris: { lat: 43.194, lng: -80.3845 },
  Parkhill: { lat: 43.162, lng: -81.1815 },
  Petrolia: { lat: 42.8668, lng: -82.1498 },
  Pickering: { lat: 43.838, lng: -79.0837 },
  'Port Dover': { lat: 42.7897, lng: -80.2092 },
  'Port Elgin': { lat: 44.4359, lng: -81.389 },
  'Richmond Hill': { lat: 43.8722, lng: -79.4344 },
  Ridgetown: { lat: 42.4392, lng: -81.8871 },
  Sarnia: { lat: 42.9744, lng: -82.4035 },
  'Sarnia-Lambton': { lat: 42.9, lng: -82.1 },
  Seaforth: { lat: 43.5547, lng: -81.3969 },
  Simcoe: { lat: 42.8334, lng: -80.2997 },
  'St. Marys': { lat: 43.2596, lng: -81.1407 },
  'St. Thomas': { lat: 42.775, lng: -81.183 },
  Stratford: { lat: 43.3708, lng: -80.9819 },
  Strathroy: { lat: 42.9564, lng: -81.6246 },
  Tecumseh: { lat: 42.3209, lng: -82.8852 },
  Tillsonburg: { lat: 42.8667, lng: -80.7333 },
  Wallaceburg: { lat: 42.5947, lng: -82.3842 },
  Waterloo: { lat: 43.4643, lng: -80.5204 },
  Whitby: { lat: 43.8975, lng: -78.9429 },
  Windsor: { lat: 42.3149, lng: -83.0364 },
  Wingham: { lat: 43.8879, lng: -81.3115 },
  Woodstock: { lat: 43.1306, lng: -80.7467 },
};
