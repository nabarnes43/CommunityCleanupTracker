import { LatLngTuple } from 'leaflet';

/**
 * Represents a marker on the map with location and additional data
 */
export interface Marker {
  /** Unique identifier for the marker */
  id?: string;
  /** Array with [latitude, longitude] coordinates */
  location: [number, number];
  /** Optional latitude property that may be in server response */
  latitude?: number;
  /** Optional longitude property that may be in server response */
  longitude?: number;
  /** Type of form used to create this marker */
  formType: string;
  /** Optional notes about the marker */
  notes?: string;
  /** Optional date when the marker was created */
  date?: string;
  /** Optional notes about the mood associated with this marker */
  moodNotes?: string;
  /** Optional array of image URLs */
  images?: string[];
  /** Optional array of video URLs */
  videos?: string[];
  /** Optional popup text for the marker */
  popUp?: string;
  
  // Dumping form specific fields
  typeOfDumping?: string;
  locationOfDumping?: string;
  amountOfDumping?: string;
  
  // Standing water form specific fields
  standingWaterLocation?: string;
  weatherCondition?: string;
  presenceOfMold?: string;
  
  // Stormwater form specific fields
  stormwaterProblemLocation?: string;
  stormwaterProblemType?: string;
  causeOfClog?: string;
}

/**
 * Represents a user in the system
 */
export interface User {
  /** Unique identifier for the user */
  id?: string;
  /** User's name */
  name: string;
  /** User's college */
  college: string;
  /** User's age */
  age: number;
}

/**
 * Form types available in the application
 */
export enum FormType {
  DUMPING = 'Dumping',
  STANDING_WATER = 'StandingWater',
  STORMWATER = 'Stormwater'
}

/**
 * Props for the PinDataForm component
 */
export interface PinDataFormProps {
  /** Callback function when form is submitted */
  onSubmit: (formData: FormData) => void;
  /** Callback function when form is cancelled */
  onCancel: () => void;
}

/**
 * Props for the MapUpdater component
 */
export interface MapUpdaterProps {
  /** User's location as [latitude, longitude] */
  userLocation: LatLngTuple | null;
  /** Zoom level for the map */
  mapZoom?: number;
}

/**
 * Props for the MarkerClusterComponent
 */
export interface MarkerClusterProps {
  /** Array of markers to display on the map */
  markers: Marker[];
} 