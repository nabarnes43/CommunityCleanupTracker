import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { createRoot, Root } from 'react-dom/client';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useNavigate } from 'react-router-dom';
import './MarkerCluster.css';
import { MarkerClusterProps, Marker } from '../../types';
import { customIcon, newMarkerIcon } from './mapIcons';
import PinCard from '../PinCard';

/**
 * Component that creates and manages marker clusters on the map
 */
const MarkerClusterComponent: React.FC<MarkerClusterProps> = ({ markers }) => {
  const map = useMap();
  const navigate = useNavigate();
  // Store root references for each popup
  const rootRefs = useRef<{[key: string]: Root}>({});
  const popupRefs = useRef<{[key: string]: HTMLDivElement}>({});
  
  useEffect(() => {
    // Create a cluster group with custom icon styling
    const markerClusterGroup = L.markerClusterGroup({
      iconCreateFunction: (cluster: L.MarkerCluster) => {
        return L.divIcon({
          html: `<div class="custom-cluster-icon">${cluster.getChildCount()}</div>`,
          className: 'marker-cluster-custom',
          iconSize: L.point(40, 40, true)
        });
      }
    });

    // Get the newly created marker ID from session storage
    const newMarkerID = sessionStorage.getItem('newMarkerID');
    console.log('New marker ID from session storage:', newMarkerID);

    // Track new marker separately
    let newMarker: L.Marker | null = null;

    // Process markers if they exist
    if (markers?.length > 0) {
      markers.forEach((marker: Marker) => {
        // Validate marker location
        if (marker.location?.length === 2) {
          // Check if this is the newest marker (matches the ID in session storage)
          const isNewMarker = newMarkerID && marker.id === newMarkerID;
          
          // Use the appropriate icon
          const icon = isNewMarker ? newMarkerIcon : customIcon;
          
          // Create a DOM element for the popup content
          const popupContainer = document.createElement('div');
          
          // Use a unique key for each marker even if id is missing
          const markerKey = marker.id || `marker-${Math.random().toString(36).substr(2, 9)}`;
          popupRefs.current[markerKey] = popupContainer;
          
          // Create marker with popup
          const leafletMarker = L.marker(marker.location, { icon })
            .bindPopup(popupContainer, {
              className: isNewMarker ? 'custom-popup highlight-popup' : 'custom-popup',
              minWidth: 300,
              maxWidth: 500
            });
          
          // Render the React component to the popup when it opens
          leafletMarker.on('popupopen', () => {
            // Create root for this popup container if it doesn't exist
            if (!rootRefs.current[markerKey]) {
              rootRefs.current[markerKey] = createRoot(popupContainer);
            }
            
            // Render using the root
            rootRefs.current[markerKey].render(
              <PinCard 
                marker={marker}
                onClick={() => {
                  if (marker.id) {
                    navigate(`/pin/${marker.id}`);
                  }
                }}
              />
            );
          });
          
          // If this is the new marker, store it separately
          if (isNewMarker) {
            newMarker = leafletMarker;
            
            // Open popup automatically after a short delay
            setTimeout(() => {
              leafletMarker.openPopup();
            }, 500);
          } else {
            // Only add to cluster if it's not the new marker
            leafletMarker.addTo(markerClusterGroup);
          }
        } else {
          console.warn('Invalid marker location:', marker);
        }
      });

      // Add the cluster group to the map
      map.addLayer(markerClusterGroup);
      
      // Add new marker directly to map if it exists
      if (newMarker) {
        map.addLayer(newMarker);
      }
    }

    // Clean up when component unmounts
    return () => {
      if (map) {
        if (markerClusterGroup) {
          map.removeLayer(markerClusterGroup);
        }
        if (newMarker) {
          map.removeLayer(newMarker);
        }
        
        // Clean up all React components rendered into popups
        Object.keys(rootRefs.current).forEach(key => {
          if (rootRefs.current[key]) {
            rootRefs.current[key].unmount();
          }
        });
      }
    };
  }, [map, markers, navigate]);

  return null;
};

export default MarkerClusterComponent;