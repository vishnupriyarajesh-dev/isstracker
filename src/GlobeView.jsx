import React, { useRef, useEffect, useMemo } from "react";
import Globe from "react-globe.gl";

var EARTH_IMG = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
var EARTH_BUMP = "https://unpkg.com/three-globe/example/img/earth-topology.png";
var NIGHT_SKY  = "https://unpkg.com/three-globe/example/img/night-sky.png";

function makeISSEl() {
  var wrap = document.createElement("div");
  wrap.style.filter = "drop-shadow(0 0 8px rgba(100,200,255,0.9))";
  wrap.innerHTML = [
    '<svg width="44" height="34" viewBox="0 0 96 72" xmlns="http://www.w3.org/2000/svg">',
    '<rect x="2" y="26" width="22" height="10" rx="2" fill="#4488dd" stroke="#6ab0ff" stroke-width="0.8"/>',
    '<rect x="25" y="28" width="16" height="8" rx="1.5" fill="#5599ee" stroke="#88ccff" stroke-width="0.7"/>',
    '<rect x="55" y="28" width="16" height="8" rx="1.5" fill="#5599ee" stroke="#88ccff" stroke-width="0.7"/>',
    '<rect x="72" y="26" width="22" height="10" rx="2" fill="#4488dd" stroke="#6ab0ff" stroke-width="0.8"/>',
    '<rect x="22" y="33" width="52" height="4" rx="1" fill="#cccccc" stroke="#aaaaaa" stroke-width="0.5"/>',
    '<rect x="36" y="20" width="24" height="22" rx="3" fill="#dddddd" stroke="#bbbbbb" stroke-width="0.8"/>',
    '<rect x="39" y="23" width="18" height="7" rx="1.5" fill="#b8d4f0" stroke="#88aacc" stroke-width="0.5"/>',
    '<rect x="44" y="12" width="8" height="9" rx="2" fill="#cccccc" stroke="#aaaaaa" stroke-width="0.6"/>',
    '<rect x="42" y="8" width="12" height="4" rx="1" fill="#ff9966" stroke="#ff7744" stroke-width="0.5"/>',
    '<rect x="42" y="60" width="12" height="4" rx="1" fill="#ff9966" stroke="#ff7744" stroke-width="0.5"/>',
    '<circle cx="48" cy="35" r="4.5" fill="#ffffff" stroke="#88aacc" stroke-width="1"/>',
    '<circle cx="48" cy="35" r="2.5" fill="#b8d4f0"/>',
    '</svg>'
  ].join("");
  wrap.style.pointerEvents = "none";
  return wrap;
}

export default function GlobeView(props) {
  var issLat = props.issLat;
  var issLon = props.issLon;
  var pastPath = props.pastPath;
  var predictedPath = props.predictedPath || [];

  var globeRef = useRef();

  useEffect(function() {
    if (!globeRef.current) return;
    globeRef.current.pointOfView({ lat: issLat, lng: issLon, altitude: 2 }, 800);
  }, [issLat, issLon]);

  var htmlMarkers = useMemo(function() {
    return [{ lat: issLat, lng: issLon }];
  }, [issLat, issLon]);

  var pastArcs = useMemo(function() {
    if (pastPath.length < 2) return [];
    return pastPath.slice(1).map(function(pt, i) {
      return {
        startLat: pastPath[i][0], startLng: pastPath[i][1],
        endLat: pt[0], endLng: pt[1],
        color: ["#e03030", "#e03030"],
        stroke: 0.6
      };
    });
  }, [pastPath]);

  var predictedArcs = useMemo(function() {
    if (!predictedPath || predictedPath.length < 2) return [];
    return predictedPath.slice(1).map(function(pt, i) {
      return {
        startLat: predictedPath[i][0], startLng: predictedPath[i][1],
        endLat: pt[0], endLng: pt[1],
        color: ["rgba(60,130,240,0.7)", "rgba(60,130,240,0.7)"],
        stroke: 0.4
      };
    });
  }, [predictedPath]);

  var allArcs = useMemo(function() {
    return pastArcs.concat(predictedArcs);
  }, [pastArcs, predictedArcs]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Globe
        ref={globeRef}
        width={window.innerWidth}
        height={window.innerHeight}
        globeImageUrl={EARTH_IMG}
        bumpImageUrl={EARTH_BUMP}
        backgroundImageUrl={NIGHT_SKY}
        htmlElementsData={htmlMarkers}
        htmlElement={function() { return makeISSEl(); }}
        htmlAltitude={0.01}
        arcsData={allArcs}
        arcColor="color"
        arcStroke="stroke"
        arcAltitude={0.01}
        atmosphereColor="#3399ff"
        atmosphereAltitude={0.18}
      />
      <div className="credit">Built by Vishnupriya | 2026</div>
    </div>
  );
}