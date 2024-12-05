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
          const response = await fetch('http://localhost:4000/user/markers', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
  
          if (response.ok) {
            const data = await response.json();
            setMarkers(data); // Update markers state with fetched data
          } else {
            console.error('Error fetching markers:', await response.json());
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
  
      fetchMarkers(); // Trigger the fetch when the component mounts
    }, []); // Empty dependency array ensures this runs only once


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

  // const handleFormSubmit = async (e) => {
  //   e.preventDefault();
  //   if (userLocation) {
  //     const newMarker = {
  //       position: userLocation,
  //       popUp: formData.title,
  //       description: formData.description
  //     };
  //     setMarkers([...markers, newMarker]);
  //     setFormData({ title: '', description: '' }); // Reset form
  //     setShowForm(false); // Hide the form after submission
      
  //     // Next, create the newMarker object with position, title, and description
  //     const savedMarker = {
  //       title: formData.title,          // Marker title or popup text
  //       description: formData.description, // Marker description
  //       position : {
  //         latitude: userLocation[0],  // Access latitude from the array
  //         longitude: userLocation[1]  // Access longitude from the array
  //       }             // Attach the position object
  //     };
      
  //     // NEW: Send the marker to the backend
  //     try {
  //       const response = await fetch('http://localhost:4000/user/createMarker', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify(savedMarker),
  //       });

  //       if (response.ok) {
  //         console.log('Marker saved successfully!');
  //       } else {
  //         console.error('Error saving marker:', await response.json());
  //       }
  //     } catch (error) {
  //       console.error('Error:', error);
  //     }
  //   }
  // };

  const handleFormSubmit = async (formData) => {
    console.log('Home Form submitted', formData); // Log to confirm form submission
  
    if (userLocation) {
      const formDataPayload = new FormData();
  
      // Append location as a JSON string
      formDataPayload.append('location', JSON.stringify({
        latitude: userLocation[0],
        longitude: userLocation[1],
      }));
  
      // Append form type
      formDataPayload.append('formType', formData.formType);
  
      // Append form-specific fields
      if (formData.formType === 'Dumping') {
        formDataPayload.append('typeOfDumping', formData.typeOfDumping);
        formDataPayload.append('locationOfDumping', formData.locationOfDumping);
        formDataPayload.append('amountOfDumping', formData.amountOfDumping);
      } else if (formData.formType === 'StandingWater') {
        formDataPayload.append('weatherCondition', formData.weatherCondition);
        formDataPayload.append('standingWaterLocation', formData.standingWaterLocation);
        formDataPayload.append('presenceOfMold', formData.presenceOfMold);
      } else if (formData.formType === 'Stormwater') {
        formDataPayload.append('stormwaterProblemLocation', formData.stormwaterProblemLocation);
        formDataPayload.append('stormwaterProblemType', formData.stormwaterProblemType);
        formDataPayload.append('causeOfClog', formData.causeOfClog);
      }
  
      // Append other common fields
      formDataPayload.append('moodNotes', formData.moodNotes);
      formDataPayload.append('notes', formData.notes);
      formDataPayload.append('date', formData.date);
  
      // Append images (files)
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image) => {
          formDataPayload.append('images', image); // Append each file individually
        });
      }
  
      // Send the form data as a POST request to the backend
      try {
        const response = await fetch('http://localhost:4000/user/createMarker', {
          method: 'POST',
          body: formDataPayload, // Send FormData directly
        });
  
        if (response.ok) {
          console.log('Marker saved successfully!');
        } else {
          const errorResponse = await response.json();
          console.error('Error saving marker:', errorResponse);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({
  //     ...formData,
  //     [name]: value
  //   });
  // };

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
      
      if (markers) {
        // Add markers to the cluster group
        markers.forEach(marker => {
          // Check if `location` exists and is a valid array with two numbers (latitude, longitude)
          if (marker.location) {
            L.marker(marker.location, { icon: customIcon }) // Use `location` array directly
              .bindPopup(`<b>${marker.title}</b><br/>${marker.description}`) // Include both title and description
              .addTo(markerClusterGroup);
          } else {
            console.warn(`Invalid marker data:`, marker);
          }
        });

      } else {
        console.warn(`Invalid markers:`, markers);
      }
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

      {/* {showForm && (
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
      )} */}

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
