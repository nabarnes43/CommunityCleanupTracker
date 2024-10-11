import React, { useState, useEffect} from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster'; // Import MarkerClusterGroup
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import './Home.css'; // Import CSS

import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster";
import L from "leaflet";
import "leaflet.markercluster";

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
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [markers, setMarkers] = useState(initialMarkers);

    // Custom component to move the map to the user's location
    const MapUpdater = () => {
      const map = useMap();
  
      // When userLocation is updated, center the map to that location
      if (userLocation) {
        map.flyTo(userLocation, 13, {
          duration: 3,
        }); // Set view to user's location with zoom level 13
      }
  
      return null; // This component doesn't render anything itself
    };

  const handleLocateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = [latitude, longitude];
          setUserLocation(location);
          setMapCenter(location); // Center the map on the user's location
          setShowForm(true); // Show the form when location is found
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (userLocation) {
      const newMarker = {
        position: userLocation,
        popUp: formData.title,
        description: formData.description
      };
      setMarkers([...markers, newMarker]);
      setFormData({ title: '', description: '' }); // Reset form
      setShowForm(false); // Hide the form after submission
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const MarkerClusterComponent = () => {
    const map = useMap();

    useEffect(() => {
      // Custom function to create cluster icons
      const createCustomClusterIcon = (cluster) => {
        return L.divIcon({
          html: `<div class="custom-cluster-icon">${cluster.getChildCount()}</div>`,
          className: 'marker-cluster-custom', // Custom class for further styling
          iconSize: L.point(40, 40, true) // Size of the cluster icon
        });
      };

      const markerClusterGroup = L.markerClusterGroup({
        iconCreateFunction: createCustomClusterIcon
      });

      // Add markers to the cluster group
      markers.forEach(marker => {
        L.marker(marker.position, {icon: customIcon})
          .bindPopup(marker.popUp)
          .addTo(markerClusterGroup);
      });

      map.addLayer(markerClusterGroup);

      return () => {
        map.removeLayer(markerClusterGroup);
      };
    }, [map]);

    return null;
  };

  return (
    <div className="container">

      <button className="location-button" onClick={handleLocateUser}>
        Drop Pin at My Location
      </button>

      {showForm && (
        <form className="pin-form" onSubmit={handleFormSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Add Pin</button>
        </form>
      )}


      <MapContainer center={mapCenter} zoom={13} className="map-container">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/#map=5/38.007/-95.844/">OpenStreetMap</a>'
          url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

          <MarkerClusterComponent />

          {userLocation && (
            <Marker position={userLocation} icon={customIcon}>
              <Popup>You are here!</Popup>
            </Marker>
          )}
        {/* Component to automatically update the map's view */}
        <MapUpdater />
      </MapContainer>
    </div>
  );
}

export default Home;
