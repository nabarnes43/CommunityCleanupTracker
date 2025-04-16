import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MarkerClusterProps } from '../../types';
import { customIcon, newMarkerIcon } from './mapIcons';

/**
 * Component that creates and manages marker clusters on the map
 * 
 * @param {MarkerClusterProps} props - Component props
 * @param {Marker[]} props.markers - Array of markers to display on the map
 * @returns {null} This component doesn't render anything
 */
const MarkerClusterComponent: React.FC<MarkerClusterProps> = ({ markers }) => {
  const map = useMap();
  
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

    // Helper function to create image HTML - separated for clarity
    const createImagesSection = (images?: string[]) => {
      if (!images?.length) return '';
            
      return `
        <div class="popup-images">
          ${images.map(url => {
            // Ensure the URL is properly formatted
            const imageUrl = url.trim();
            
            return `
              <a href="${imageUrl}" target="_blank" class="image-container">
                <img 
                  src="${imageUrl}" 
                  alt="Site photo" 
                  style="width: 100px; height: 100px; object-fit: cover; margin: 2px; border-radius: 4px;"
                  onerror="console.error('Failed to load image:', this.src); this.style.display='none'; this.nextElementSibling.style.display='flex';"
                />
                <div style="display: none; width: 100px; height: 100px; background-color: #f0f0f0; justify-content: center; align-items: center; color: #666; font-size: 12px; border-radius: 4px; margin: 2px;">
                  Image unavailable
                </div>
              </a>
            `;
          }).join('')}
        </div>
      `;
    };

    // Get the newly created marker ID from session storage
    const newMarkerID = sessionStorage.getItem('newMarkerID');
    console.log('New marker ID from session storage:', newMarkerID);

    // Track new marker separately
    let newMarker: L.Marker | null = null;

    // Process markers if they exist
    if (markers?.length > 0) {
      markers.forEach(marker => {
        // Validate marker location
        if (marker.location?.length === 2) {
          // Check if this is the newest marker (matches the ID in session storage)
          const isNewMarker = newMarkerID && marker.id === newMarkerID;
          
          // Use the appropriate icon
          const icon = isNewMarker ? newMarkerIcon : customIcon;
          
          // Create a special class for the popup if it's the newest marker
          const popupClass = isNewMarker ? 'custom-popup highlight-popup' : 'custom-popup';
          
          // Create the complete popup content by combining all sections
          const popupContent = `
            <div class="map-popup">
              <h3>${marker.formType || 'Unknown Type'}</h3>
              ${isNewMarker ? '<p style="border: 2px solid red; padding: 5px; border-radius: 4px;"><strong>Status:</strong> Just added</p>' : ''}
              ${marker.date ? `<p><strong>Date:</strong> ${new Date(marker.date + 'T12:00:00').toLocaleDateString()}</p>` : ''}              
              ${marker.details && Object.keys(marker.details).length > 0 ? `
                  ${Object.entries(marker.details)
                    .filter(([_, value]) => value !== null && value !== '')
                    .map(([key, value]) => {
                      // Format key from camelCase to Title Case (e.g., typeOfDumping → Type Of Dumping)
                      const formattedKey = key.replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase());
                      return `<p><strong>${formattedKey}:</strong> ${value}</p>`;
                    }).join('')}
              ` : ''}
              ${marker.notes ? `<p><strong>Notes:</strong> ${marker.notes}</p>` : ''}
              ${createImagesSection(marker.images)}
            </div>
          `;

          // Create marker with popup
          const leafletMarker = L.marker(marker.location, { icon })
            .bindPopup(popupContent, {
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
      }
    };
  }, [map, markers]);

  return null;
};

export default MarkerClusterComponent; 