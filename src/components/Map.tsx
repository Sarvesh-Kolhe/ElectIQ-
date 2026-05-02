import { useState } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin,
  InfoWindow
} from '@vis.gl/react-google-maps';
import { ExternalLink, Globe } from 'lucide-react';
import { PollingStation } from '../data/mockData';

interface MapProps {
  stations: PollingStation[];
  center: [number, number];
  activities?: Record<string, number>;
}

export default function ElectionMap({ stations, center, activities = {} }: MapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [selectedStation, setSelectedStation] = useState<PollingStation | null>(null);

  // If no API key is provided, show a helpful message
  if (!apiKey) {
    return (
      <div className="w-full h-full bg-slate-100/50 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-4 border-2 border-dashed border-slate-300">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent">
          <Globe size={32} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-bold text-slate-800">Google Maps Integration</h4>
          <p className="text-sm text-slate-500 max-w-sm">
            To view the interactive polling station matrix, please configure your 
            <code className="mx-1 px-1.5 py-0.5 bg-slate-200 rounded font-mono text-[10px]">VITE_GOOGLE_MAPS_API_KEY</code>
            in the project settings.
          </p>
        </div>
        <button 
          onClick={() => window.open('https://console.cloud.google.com/google/maps-apis/overview', '_blank')}
          className="text-xs font-bold text-accent hover:underline flex items-center gap-1.5 uppercase tracking-widest"
        >
          Get API Key <ExternalLink size={12} />
        </button>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <Map
          defaultCenter={{ lat: center[0], lng: center[1] }}
          defaultZoom={12}
          mapId="bf51a910020fa804" 
          disableDefaultUI={true}
          className="w-full h-full"
        >
          {stations.map((station) => {
            const activity = activities[station.id] || 50;
            return (
              <AdvancedMarker
                key={station.id}
                position={{ lat: station.lat, lng: station.lng }}
                onClick={() => setSelectedStation(station)}
              >
                <div className="relative group cursor-pointer">
                  <div className="absolute -inset-4 bg-accent/20 rounded-full blur-xl group-hover:bg-accent/40 transition-all animate-pulse" />
                  <Pin 
                    background={'#5E6AD2'} 
                    glyphColor={'#ffffff'} 
                    borderColor={'#ffffff'}
                    scale={1.2}
                  />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                </div>
              </AdvancedMarker>
            );
          })}

          {selectedStation && (
            <InfoWindow
              position={{ lat: selectedStation.lat, lng: selectedStation.lng }}
              onCloseClick={() => setSelectedStation(null)}
              headerDisabled={true}
              className="custom-info-window"
            >
              <div className="p-1 min-w-[220px] bg-white text-slate-900 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-accent text-sm leading-tight">{selectedStation.name}</h4>
                  <div className="flex items-center gap-1.5 shrink-0 ml-4">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                    <span className="text-[9px] font-mono font-bold text-accent uppercase tracking-tighter">Live</span>
                  </div>
                </div>
                <p className="text-[10px] mb-3 text-slate-500 leading-relaxed font-medium">{selectedStation.address}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Node Activity</span>
                    <span className="text-accent">{activities[selectedStation.id] || 50}%</span>
                  </div>
                  <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-1000" 
                      style={{ width: `${activities[selectedStation.id] || 50}%` }} 
                    />
                  </div>
                  
                  <div className="pt-2 border-t border-black/5">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedStation.name} ${selectedStation.address}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-accent hover:underline flex items-center justify-center gap-1 font-bold uppercase tracking-widest"
                    >
                      View Satellite Matrix <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
