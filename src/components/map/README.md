# Map components (provider-agnostic)

The app uses **one map API**: `MapView` with props from `@/lib/map/types`. All pages use `<MapView center={...} markers={...} />` and never import Leaflet or Mapbox directly.

## Current provider: Leaflet

- Implementation: `providers/LeafletMapView.tsx`
- Wired in: `MapView.tsx` (dynamic import, no SSR)

## Switching to Mapbox later

1. **Implement the same contract**  
   Create `providers/MapboxMapView.tsx` that accepts `MapViewProps` from `@/lib/map/types` (center, zoom, markers, polygons, className, height, interactive).

2. **Swap the provider**  
   In `MapView.tsx`, change the dynamic import from `LeafletMapView` to `MapboxMapView`. No other files need to change.

3. **Optional:** Use env to choose at runtime, e.g.  
   `NEXT_PUBLIC_MAP_PROVIDER=mapbox` and in `MapView.tsx` load Leaflet or Mapbox based on that.

All map usage stays in terms of `MapCenter`, `MapMarker`, `MapBounds`, `MapPolygon`—no provider-specific types in the app.
