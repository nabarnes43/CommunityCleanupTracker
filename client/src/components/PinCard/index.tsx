import React from "react";
import { Marker } from "../../types";
import { renderMarkerDescription } from "../../utils/formTypeUtils";
import { formatDate } from "../../utils/formatDate";
import "./PinCard.css";

/**
 * Props for the PinCard component
 */
interface PinCardProps {
  /** The marker data to display */
  marker: Marker;
  /** Optional click handler for the card */
  onClick?: () => void;
  /** Address to display - optional as it might be loaded asynchronously */
  address?: string;
}

/**
 * A reusable component that displays information about a marker/pin
 *
 * @param {PinCardProps} props - Component props
 * @returns {JSX.Element} The rendered PinCard component
 */
const PinCard: React.FC<PinCardProps> = ({ marker, onClick, address }) => {
  // Get address for display
  const getDisplayAddress = () => {
    // If address is provided explicitly, use it
    if (address) {
      return address;
    }

    // Otherwise fall back to coordinates
    if (
      marker.location &&
      Array.isArray(marker.location) &&
      marker.location.length === 2
    ) {
      const [lat, lng] = marker.location;
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }

    return "Unknown location";
  };

  return (
    <div className="pin-card" onClick={onClick}>
      <div className="pin-info">
        <h3>{getDisplayAddress()}</h3>
        <p className="pin-description">{renderMarkerDescription(marker)}</p>
        <p className="pin-date">{formatDate(marker.date || "")}</p>
      </div>
      {marker.images && marker.images.length > 0 && (
        <div className="pin-image">
          <img src={marker.images[0]} alt={`${marker.formType} at location`} />
        </div>
      )}
    </div>
  );
};

export default PinCard;
