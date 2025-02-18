import React, { useState, useEffect} from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import './Home.css'; // Import CSS
import PinDataForm from '../PinDataForm/PinDataForm'; // Import the form component


import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster";
import L from "leaflet";
import "leaflet.markercluster";

const customIcon = new Icon({
  iconUrl: require("../../img/marker.png"),
  iconSize: [38, 38]
});

const newMarkerIcon = new Icon ({
  iconUrl: require("../../img/newMarker.png"),
  iconSize: [50, 50]
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
  const [mapCenter, setMapCenter] = useState([33.7501, -84.3885]);
  const [userLocation, setUserLocation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [markers, setMarkers] = useState(initialMarkers);

    // Fetch existing markers from the backend when the component mounts
    useEffect(() => {
      const fetchMarkers = async () => {
        try {
          const response = await fetch('http://localhost:4000/user/markers');
          if (response.ok) {
            const data = await response.json();
            console.log('Fetched markers:', data); // Debug log
            if (!Array.isArray(data)) {
              console.error('Expected array of markers, got:', typeof data);
              return;
            }
            setMarkers(data);
          } else {
            const errorData = await response.json();
            console.error('Error fetching markers:', errorData);
          }
        } catch (error) {
          console.error('Fetch error:', error);
        }
      };
    
      fetchMarkers();
    }, []);


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
      setShowForm(true); // Show the form when location is found
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = [latitude, longitude];
          setUserLocation(location);
          setMapCenter(location); // Center the map on the user's location
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

const handleFormSubmit = async (formData) => {
  console.log('Home Form submitted'); 
  
  // Debug log the incoming FormData contents
  for (let pair of formData.entries()) {
    console.log('Incoming form data:', pair[0], pair[1]);
  }

  if (userLocation) {
    // Since we already have a FormData object, we should use it directly
    // First, let's add the location data
    formData.append('location', JSON.stringify({
      latitude: userLocation[0],
      longitude: userLocation[1],
    }));

    try {
      // We can now send the FormData directly to the backend
      const response = await fetch('http://localhost:4000/user/createMarker', {
        method: 'POST',
        body: formData, // Using the original FormData object
      });

      if (response.ok) {
        console.log('Marker saved successfully!');
        setShowForm(false); // Close the form on success
      } else {
        const errorResponse = await response.json();
        console.error('Error saving marker:', errorResponse);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  } else {
    console.error('User location not available');
  }
};
  
  //TODO comment cleanup
  const MarkerClusterComponent = () => {
    const map = useMap();
    
    useEffect(() => {
      // Create a cluster group with custom icon styling
      const markerClusterGroup = L.markerClusterGroup({
        iconCreateFunction: (cluster) => {
          return L.divIcon({
            html: `<div class="custom-cluster-icon">${cluster.getChildCount()}</div>`,
            className: 'marker-cluster-custom',
            iconSize: L.point(40, 40, true)
          });
        }
      });
  
      // Helper function to create image HTML - separated for clarity
      const createImagesSection = (images) => {
        if (!images?.length) return '';
        return `
          <div class="popup-images">
            ${images.map(url => `
              <a href="${url}" target="_blank">
                <img 
                  src="${url}" 
                  alt="Site" 
                  style="width: 100px; height: 100px; object-fit: cover; margin: 2px; border-radius: 4px;"
                  onerror="this.onerror=null; this.src='placeholder.jpg';"
                />
              </a>
            `).join('')}
          </div>
        `;
      };

      // Helper function to create video HTML - separated for clarity
      const createVideosSection = (videos) => {
        if (!videos?.length) return '';
        return `
          <div class="popup-videos">
            ${videos.map(url => `
              <div class="video-container">
                <video 
                  controls 
                  width="200" 
                  style="margin: 2px; border-radius: 4px;"
                  preload="metadata"
                >
                  <source src="${url}" type="video/mp4">
                  Your browser does not support the video tag.
                </video>
              </div>
            `).join('')}
          </div>
        `;
      };

      // Process markers if they exist
      if (markers?.length > 0) {
        markers.forEach(marker => {
          // Validate marker location
          if (marker.location?.length === 2) {
            // Create the complete popup content by combining all sections
            const popupContent = `
              <div class="map-popup">
                <h3>${marker.formType || 'Unknown Type'}</h3>
                ${marker.notes ? `<p><strong>Notes:</strong> ${marker.notes}</p>` : ''}
                ${marker.date ? `<p><strong>Date:</strong> ${new Date(marker.date).toLocaleDateString()}</p>` : ''}
                ${marker.moodNotes ? `<p><strong>Mood Notes:</strong> ${marker.moodNotes}</p>` : ''}
                ${createImagesSection(marker.images)}
                ${createVideosSection(marker.videos)}
              </div>
            `;
  
            // Create and add the marker to the cluster group
            L.marker(marker.location, { icon: customIcon })
              .bindPopup(popupContent, {
                maxWidth: 300,
                maxHeight: 400,
                autoPanPadding: [50, 50]
              })
              .addTo(markerClusterGroup);
          } else {
            console.warn('Invalid marker location:', marker);
          }
        });
  
        // Add the cluster group to the map
        map.addLayer(markerClusterGroup);
      }
  
      // Cleanup function
      return () => {
        if (map.hasLayer(markerClusterGroup)) {
          map.removeLayer(markerClusterGroup);
        }
      };
    }, [map, markers]);
  
    return null;
};

  //TODO Split this into seperate components maybe
  return (
    <div className="container">

      <button className="location-button" onClick={handleLocateUser}>
        Drop Pin at My Location
      </button>

      {/* Display the PinDataForm as a modal if showForm is true */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <PinDataForm 
              onSubmit={handleFormSubmit} 
              onCancel={() => setShowForm(false)} 
            />
          </div>
        </div>
      )}


      <MapContainer center={mapCenter} zoom={13} className="map-container">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/#map=5/38.007/-95.844/">OpenStreetMap</a>'
          url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

          <MarkerClusterComponent />

          {userLocation && (
            <Marker position={userLocation} icon={newMarkerIcon}>
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
