import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import './Home.css'; // Import CSS


const customIcon = new Icon({
  iconUrl: require("../../img/marker.png"),
  iconSize: [38, 38]
});

const initialMarkers = [
  {
    position: [51.505, -0.09],
    popUp: "Marker 1"
  },
  {
    position: [51.51, -0.1],
    popUp: "Marker 2"
  },
  {
    position: [51.49, -0.1],
    popUp: "Marker 3"
  }
];

const Home = () => {
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [userLocation, setUserLocation] = useState(null);

  return (
    <div className="container">
      <MapContainer center={mapCenter} zoom={13} className="map-container">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/#map=5/38.007/-95.844/">OpenStreetMap</a>'
          url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        {initialMarkers.map((marker, index) => (
          <Marker key={index} position={marker.position} icon={customIcon}>
            <Popup>{marker.popUp}</Popup>
          </Marker>
        ))}

        {userLocation && (
          <Marker position={userLocation} icon={customIcon}>
            <Popup>You are here!</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default Home;
