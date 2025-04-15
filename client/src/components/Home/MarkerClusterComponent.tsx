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

    // Helper function to create video HTML - separated for clarity
    const createVideosSection = (videos?: string[]) => {
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

    // Get the newly created marker ID from session storage
    const newMarkerID = sessionStorage.getItem('newMarkerID');
    console.log('New marker ID from session storage:', newMarkerID);

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
              ${isNewMarker ? '<p><strong>Status:</strong> Just added</p>' : ''}
              ${marker.notes ? `<p><strong>Notes:</strong> ${marker.notes}</p>` : ''}
              ${marker.date ? `<p><strong>Date:</strong> ${new Date(marker.date).toLocaleDateString()}</p>` : ''}
              ${marker.moodNotes ? `<p><strong>Mood Notes:</strong> ${marker.moodNotes}</p>` : ''}
              ${createImagesSection(marker.images)}
              ${createVideosSection(marker.videos)}
            </div>
          `;

          // Create and add the marker to the cluster group
          const leafletMarker = L.marker(marker.location, { icon });
          
          // If this is the new marker, open its popup automatically after a short delay
          if (isNewMarker) {
            setTimeout(() => {
              leafletMarker.openPopup();
            }, 500);
          }
          
          leafletMarker
            .bindPopup(popupContent, {
              maxWidth: 300,
              maxHeight: 400,
              autoPanPadding: [50, 50],
              closeButton: true,
              className: popupClass
            })
            .addTo(markerClusterGroup);
        } else {
          console.warn('Invalid marker location:', marker);
        }
      });

      // Add the cluster group to the map
      map.addLayer(markerClusterGroup);
    }

    // Clean up when component unmounts
    return () => {
      if (map && markerClusterGroup) {
        map.removeLayer(markerClusterGroup);
      }
    };
  }, [map, markers]);

  return null;
};

export default MarkerClusterComponent; 