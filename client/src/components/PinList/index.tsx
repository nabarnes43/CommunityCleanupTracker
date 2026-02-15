import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMarkers } from "../../apiService";
import { Marker } from "../../types";
import PinCard from "../PinCard";
import { reverseGeocode } from "../../utils/reverseGeocode";
import "./PinList.css";

/**
 * PinList component that displays a list of all markers/pins
 *
 * @returns {JSX.Element} The rendered PinList component
 */
const PinList: React.FC = () => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  //TODO make addresses stored in the database rather fetched real time
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const getMarkers = async () => {
      try {
        setLoading(true);
        const data = await fetchMarkers();
        setMarkers(data);
        setError(null);

        // Once we have markers, get addresses for each one
        if (data.length > 0) {
          const addressPromises = data.map((marker: Marker) =>
            getAddressFromCoordinates(marker.location, marker.id || ""),
          );

          // We'll handle address loading asynchronously, so we don't block UI rendering
          Promise.all(addressPromises).catch((err) => {
            console.error("Error fetching some addresses:", err);
          });
        }
      } catch (err) {
        setError("Failed to load pins. Please try again later.");
        console.error("Error fetching markers:", err);
      } finally {
        setLoading(false);
      }
    };

    getMarkers();
  }, []);

  // Reverse geocoding function to get address from coordinates
  const getAddressFromCoordinates = async (
    location: [number, number],
    markerId: string,
  ) => {
    if (!location || !Array.isArray(location) || location.length !== 2) return;
    const [latitude, longitude] = location;
    const address = await reverseGeocode(latitude, longitude);
    setAddresses((prev) => ({ ...prev, [markerId]: address }));
  };

  const handlePinClick = (markerId: string) => {
    navigate(`/pin/${markerId}`);
  };

  return (
    <div className="pin-list-container">
      <h1 className="pin-list-header">Markers</h1>

      {loading && <div className="pin-list-loading">Loading pins...</div>}

      {error && <div className="pin-list-error">{error}</div>}

      {!loading && !error && markers.length === 0 && (
        <div className="pin-list-empty">
          No pins found. Create some pins on the map!
        </div>
      )}

      <div className="pin-list">
        {markers.map((marker) => (
          <PinCard
            key={marker.id}
            marker={marker}
            address={marker.id ? addresses[marker.id] : undefined}
            onClick={() => marker.id && handlePinClick(marker.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PinList;
