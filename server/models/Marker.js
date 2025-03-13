/**
 * @fileoverview Marker model for Community Cleanup Tracker
 * Defines the structure and validation for cleanup markers
 * @module models/Marker
 */

const { z } = require('zod');

/**
 * Marker status enum
 */
const MarkerStatusEnum = z.enum([
  'pending', 
  'in_progress', 
  'completed', 
  'cancelled'
]);

/**
 * Marker schema for validation
 * @type {ZodObject}
 */
const MarkerSchema = z.object({
  /**
   * Marker's unique identifier
   */
  id: z.string().optional(),

  /**
   * Title of the cleanup location
   */
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title must be a string"
  }).min(3, { message: "Title must be at least 3 characters long" }),

  /**
   * Description of the cleanup site
   */
  description: z.string({
    required_error: "Description is required",
    invalid_type_error: "Description must be a string"
  }).min(10, { message: "Description must be at least 10 characters long" }),

  /**
   * Geographical latitude of the marker
   */
  latitude: z.number({
    required_error: "Latitude is required",
    invalid_type_error: "Latitude must be a number"
  }).min(-90).max(90),

  /**
   * Geographical longitude of the marker
   */
  longitude: z.number({
    required_error: "Longitude is required",
    invalid_type_error: "Longitude must be a number"
  }).min(-180).max(180),

  /**
   * Status of the cleanup marker
   */
  status: MarkerStatusEnum.default('pending'),

  /**
   * User ID who created the marker
   */
  userId: z.string({
    required_error: "User ID is required",
    invalid_type_error: "User ID must be a string"
  }),

  /**
   * Optional image URL for the cleanup site
   */
  imageUrl: z.string().url({ message: "Invalid image URL" }).optional(),

  /**
   * Timestamp of marker creation
   */
  createdAt: z.date().optional(),

  /**
   * Estimated cleanup date
   */
  cleanupDate: z.date().optional(),

  /**
   * Optional tags or categories for the cleanup
   */
  tags: z.array(z.string()).optional()
});

/**
 * Validate marker data
 * @function validateMarker
 * @param {Object} markerData - Marker data to validate
 * @returns {Object} Validated marker data
 * @throws {ZodError} If validation fails
 */
function validateMarker(markerData) {
  return MarkerSchema.parse(markerData);
}

/**
 * Partially validate marker data (for updates)
 * @function validatePartialMarker
 * @param {Object} markerData - Partial marker data to validate
 * @returns {Object} Partially validated marker data
 * @throws {ZodError} If validation fails
 */
function validatePartialMarker(markerData) {
  return MarkerSchema.partial().parse(markerData);
}

module.exports = {
  MarkerSchema,
  MarkerStatusEnum,
  validateMarker,
  validatePartialMarker
}; 