import "leaflet/dist/leaflet.css";
import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import terminator from "@joergdietrich/leaflet.terminator";

const ISS_SVG = `
<svg width="48" height="36" viewBox="0 0 96 72" xmlns="http://www.w3.org/2000/svg">
  <circle cx="48" cy="36" r="20" fill="none" stroke="rgba(100,200,255,0.18)" stroke-width="6"/>
  <rect x="2" y="26" width="22" height="10" rx="2" fill="#4488dd" stroke="#6ab0ff" stroke-width="0.8"/>
  <line x1="6"  y1="26" x2="6"  y2="36" stroke="#2255aa" stroke-width="0.7"/>
  <line x1="10" y1="26" x2="10" y2="36" stroke="#2255aa" stroke-width="0.7"/>
  <line x1="14" y1="26" x2="14" y2="36" stroke="#2255aa" stroke-width="0.7"/>
  <line x1="18" y1="26" x2="18" y2="36" stroke="#2255aa" stroke-width="0.7"/>
  <rect x="25" y="28" width="16" height="8" rx="1.5" fill="#5599ee" stroke="#88ccff" stroke-width="0.7"/>
  <line x1="28" y1="28" x2="28" y2="36" stroke="#2255aa" stroke-width="0.6"/>
  <line x1="31" y1="28" x2="31" y2="36" stroke="#2255aa" stroke-width="0.6"/>
  <line x1="34" y1="28" x2="34" y2="36" stroke="#2255aa" stroke-width="0.6"/>
  <line x1="37" y1="28" x2="37" y2="36" stroke="#2255aa" stroke-width="0.6"/>
  <rect x="55" y="28" width="16" height="8" rx="1.5" fill="#5599ee" stroke="#88ccff" stroke-width="0.7"/>
  <line x1="58" y1="28" x2="58" y2="36" stroke="#2255aa" stroke-width="0.6"/>
  <line x1="61" y1="28" x2="61" y2="36" stroke="#2255aa" stroke-width="0.6"/>
  <line x1="64" y1="28" x2="64" y2="36" stroke="#2255aa" stroke-width="0.6"/>
  <line x1="67" y1="28" x2="67" y2="36" stroke="#2255aa" stroke-width="0.6"/>
  <rect x="72" y="26" width="22" height="10" rx="2" fill="#4488dd" stroke="#6ab0ff" stroke-width="0.8"/>
  <line x1="76" y1="26" x2="76" y2="36" stroke="#2255aa" stroke-width="0.7"/>
  <line x1="80" y1="26" x2="80" y2="36" stroke="#2255aa" stroke-width="0.7"/>
  <line x1="84" y1="26" x2="84" y2="36" stroke="#2255aa" stroke-width="0.7"/>
  <line x1="88" y1="26" x2="88" y2="36" stroke="#2255aa" stroke-width="0.7"/>
  <rect x="22" y="33" width="52" height="4" rx="1" fill="#cccccc" stroke="#aaaaaa" stroke-width="0.5"/>
  <rect x="36" y="20" width="24" height="22" rx="3" fill="#dddddd" stroke="#bbbbbb" stroke-width="0.8"/>
  <rect x="39" y="23" width="18" height="7" rx="1.5" fill="#b8d4f0" stroke="#88aacc" stroke-width="0.5"/>
  <rect x="39" y="32" width="18" height="7" rx="1.5" fill="#b8d4f0" stroke="#88aacc" stroke-width="0.5"/>
  <rect x="44" y="12" width="8" height="9" rx="2" fill="#cccccc" stroke="#aaaaaa" stroke-width="0.6"/>
  <rect x="44" y="51" width="8" height="9" rx="2" fill="#cccccc" stroke="#aaaaaa" stroke-width="0.6"/>
  <rect x="42" y="8"  width="12" height="4" rx="1" fill="#ff9966" stroke="#ff7744" stroke-width="0.5"/>
  <rect x="42" y="60" width="12" height="4" rx="1" fill="#ff9966" stroke="#ff7744" stroke-width="0.5"/>
  <circle cx="48" cy="35" r="4.5" fill="#ffffff" stroke="#88aacc" stroke-width="1"/>
  <circle cx="48" cy="35" r="2.5" fill="#b8d4f0"/>
</svg>`;

const issIcon = L.divIcon({ html: ISS_SVG, className: "", iconSize: [48, 36], iconAnchor: [24, 18] });

function ISSLayer({ issLat, issLon }) {
  const map = useMap();
  const markerRef = useRef(null);
  const terminatorRef = useRef(null);

  useEffect(() => {
    if (!markerRef.current) {
      markerRef.current = L.marker([issLat, issLon], { icon: issIcon }).addTo(map);
    } else {
      markerRef.current.setLatLng([issLat, issLon]);
    }
    if (!terminatorRef.current) {
      terminatorRef.current = terminator({ fillOpacity: 0.25, color: "#334", weight: 1 }).addTo(map);
    } else {
      terminatorRef.current.setTime(new Date());
    }
  }, [issLat, issLon, map]);

  useEffect(() => {
    return () => {
      if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
      if (terminatorRef.current) { terminatorRef.current.remove(); terminatorRef.current = null; }
    };
  }, []);

  return null;
}

export default function MapView({ issLat, issLon, pastPath, predictedPath }) {
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <MapContainer center={[issLat, issLon]} zoom={3} style={{ width: "100%", height: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© Leaflet | © OpenStreetMap" />
        {pastPath.length > 1 && <Polyline positions={pastPath} pathOptions={{ color: "#e03030", weight: 2.5, opacity: 0.85 }} />}
        {predictedPath.length > 1 && <Polyline positions={predictedPath} pathOptions={{ color: "#3070e0", weight: 1.5, opacity: 0.5, dashArray: "6 5" }} />}
        <ISSLayer issLat={issLat} issLon={issLon} />
      </MapContainer>
      <div className="credit">Built by Vishnupriya | 2026</div>
    </div>
  );
}