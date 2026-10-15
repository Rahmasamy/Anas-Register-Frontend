'use client';

import { useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

export type MapCoordinates = {
  latitude: number;
  longitude: number;
};

const fayoumCenter: [number, number] = [29.3084, 30.8428];
const selectedIcon = L.divIcon({
  className: 'activity-map-marker',
  html: '<span></span>',
  iconSize: [28, 36],
  iconAnchor: [14, 34],
});

function MapClickHandler({ onSelect }: { onSelect: (coordinates: MapCoordinates) => void }) {
  useMapEvents({
    click: ({ latlng }) => onSelect({ latitude: latlng.lat, longitude: latlng.lng }),
  });
  return null;
}

export default function LocationMapPicker({
  initialPosition,
  onConfirm,
}: {
  initialPosition: MapCoordinates | null;
  onConfirm: (coordinates: MapCoordinates) => void;
}) {
  const [selectedPosition, setSelectedPosition] = useState(initialPosition);
  const center = selectedPosition
    ? [selectedPosition.latitude, selectedPosition.longitude] as [number, number]
    : fayoumCenter;

  return <div className="location-map-picker">
    <p className="map-picker-instructions">انقر على الخريطة لتحديد موقع ممارسة النشاط.</p>
    <div className="activity-map-frame">
      <MapContainer center={center} zoom={selectedPosition ? 15 : 9} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onSelect={setSelectedPosition} />
        {selectedPosition && <Marker position={[selectedPosition.latitude, selectedPosition.longitude]} icon={selectedIcon} />}
      </MapContainer>
    </div>
    {selectedPosition && <p className="selected-map-coordinates" dir="ltr">
      {selectedPosition.latitude.toFixed(6)}, {selectedPosition.longitude.toFixed(6)}
    </p>}
    <button
      className="button button-primary map-confirm-button"
      type="button"
      disabled={!selectedPosition}
      onClick={() => { if (selectedPosition) onConfirm(selectedPosition); }}
    >
      اعتماد موقع النشاط
    </button>
  </div>;
}