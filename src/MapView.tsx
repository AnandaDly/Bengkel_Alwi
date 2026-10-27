import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Workshop } from './types';
const TILE_URL = import.meta.env.VITE_OSM_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export function MapView({ workshops = [], selected, onSelect, center, pick, point }: { workshops?: Workshop[]; selected?: string; onSelect?: (id: string) => void; center: [number, number]; pick?: (point: [number, number]) => void; point?: [number, number] }) {
  const el = useRef<HTMLDivElement>(null); const map = useRef<L.Map | null>(null); const markers = useRef<L.LayerGroup | null>(null); const pickRef = useRef(pick); const selectRef = useRef(onSelect); const [failed, setFailed] = useState(false);
  pickRef.current = pick; selectRef.current = onSelect;
  useEffect(() => {
    if (!el.current) return;
    const instance = L.map(el.current, { zoomControl: false, scrollWheelZoom: false }).setView(center, 13); map.current = instance;
    L.control.zoom({ position: 'bottomright' }).addTo(instance);
    L.tileLayer(TILE_URL, { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors', maxZoom: 19 }).on('tileerror', () => setFailed(true)).addTo(instance);
    markers.current = L.layerGroup().addTo(instance);
    instance.on('click', e => pickRef.current?.([Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6))]));
    const resize = new ResizeObserver(() => instance.invalidateSize()); resize.observe(el.current);
    return () => { resize.disconnect(); instance.remove(); map.current = null; };
  }, []);
  useEffect(() => { map.current?.setView(center, map.current.getZoom(), { animate: false }); }, [center[0], center[1]]);
  useEffect(() => {
    const layer = markers.current; if (!layer) return; layer.clearLayers();
    for (const w of workshops) {
      const chosen = selected === w.id;
      const icon = L.divIcon({ className: 'map-pin-wrap', html: `<div class="map-pin ${chosen ? 'selected' : ''}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9"><path d="m14 6 4 4-9 9-4-4zM14 6V3l-3 3 1 5M18 10h3l-3 3-5-1"/></svg>${chosen ? '<span>★ ' + w.rating.toFixed(1) + '</span>' : ''}</div>`, iconSize: [chosen ? 72 : 38, 42], iconAnchor: [chosen ? 36 : 19, 42] });
      const marker = L.marker([w.lat, w.lng], { icon, title: w.name, alt: w.name, zIndexOffset: chosen ? 500 : 0 }).on('click', () => selectRef.current?.(w.id));
      const label = document.createElement('span'); label.textContent = w.name; marker.bindTooltip(label, { direction: 'top', offset: [0, -40] }).addTo(layer);
    }
    if (point) L.circleMarker(point, { radius: 9, weight: 4, color: '#fff', fillColor: '#1264e3', fillOpacity: 1 }).addTo(layer);
  }, [workshops, selected, point?.[0], point?.[1]]);
  return <div className="map-wrapper"><div className="map-canvas" ref={el} aria-label={pick ? 'Klik peta untuk menentukan lokasi bengkel' : 'Peta bengkel di Jakarta'}/>{failed && <div className="map-error" role="status">Sebagian peta belum dimuat. Daftar bengkel tetap tersedia.<button onClick={() => { setFailed(false); map.current?.eachLayer(layer => { if (layer instanceof L.TileLayer) layer.redraw(); }); }}>Coba lagi</button></div>}{pick && <span className="map-pick-hint">Klik peta untuk menempatkan titik bengkel</span>}</div>;
}
