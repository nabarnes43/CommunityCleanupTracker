import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MarkerClusterProps } from '../../types';
import { customIcon } from './mapIcons';

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

export default MarkerClusterComponent; 