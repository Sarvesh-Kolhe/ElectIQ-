import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink } from 'lucide-react';
import { PollingStation } from '../data/mockData';

// Fix for default marker icons in Leaflet with Vite/React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

//@ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapProps {
  stations: PollingStation[];
  center: [number, number];
  activities?: Record<string, number>;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
}

export default function ElectionMap({ stations, center, activities = {} }: MapProps) {
  // Function to create custom animated marker icon
  const createPulseIcon = (activity: number) => {
    const size = 12 + (activity / 20); // Dynamic size based on activity
    const opacity = 0.3 + (activity / 150);
    
    return L.divIcon({
      className: 'custom-pulse-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-6 h-6 bg-accent rounded-full animate-ping opacity-20" style="animation-duration: ${3 - (activity / 50)}s"></div>
          <div class="relative w-3 h-3 bg-accent rounded-full border-2 border-white shadow-[0_0_10px_rgba(94,106,210,0.8)]"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <MapContainer 
      center={center} 
      zoom={12} 
      className="w-full h-full"
      zoomControl={false}
    >
      <ChangeView center={center} />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {stations.map(station => {
        const activity = activities[station.id] || 50;
        return (
          <Marker 
              key={station.id} 
              position={[station.lat, station.lng]}
              icon={createPulseIcon(activity)}
          >
            <Popup>
              <div className="p-2 min-w-[200px] bg-white text-slate-900 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-accent">{station.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                    <span className="text-[9px] font-mono font-bold text-accent uppercase tracking-tighter">Live</span>
                  </div>
                </div>
                <p className="text-[10px] mb-3 text-slate-500 leading-relaxed">{station.address}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Node Activity</span>
                    <span className="text-accent">{activity}%</span>
                  </div>
                  <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${activity}%` }} />
                  </div>
                  
                  <div className="pt-2 border-t border-black/5">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${station.name} ${station.address}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-accent hover:underline flex items-center justify-center gap-1 font-bold uppercase tracking-widest"
                    >
                      View Satellite Matrix <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
