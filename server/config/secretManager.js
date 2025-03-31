/**
 * @fileoverview Google Cloud Secret Manager configuration and helper functions
 * @module config/secretManager
 */

const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Create the Secret Manager client
const client = new SecretManagerServiceClient();

// Map internal secret names to the actual secret names in Secret Manager
const SECRET_NAME_MAP = {
  'firebase-credentials': 'firebase-app-hosting-github-oauth-github-oauthtoken-d5eb75'
};

/**
 * Retrieves a secret from either local credentials or Google Cloud Secret Manager
 * @param {string} secretName - Name of the secret to retrieve
 * @returns {Promise<object>} The secret payload
 */
async function getSecret(secretName) {
  try {
    // Ensure NODE_ENV is set
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'development';
      logger.warn('NODE_ENV was not set, defaulting to development');
    }

    logger.debug(`Attempting to retrieve secret: ${secretName}`);
    logger.debug(`Current environment: ${process.env.NODE_ENV}`);

    // In development, use local credentials
    if (process.env.NODE_ENV === 'development') {
      const credentialsPath = path.join(__dirname, '..', 'credentials', `${secretName}.json`);
      logger.debug(`Looking for credentials at: ${credentialsPath}`);
      
      if (!fs.existsSync(credentialsPath)) {
        const error = new Error(`Local credentials file not found: ${credentialsPath}`);
        logger.error('Credentials file not found', {
          path: credentialsPath,
          secretName,
          environment: process.env.NODE_ENV
        });
        throw error;
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      logger.info('Successfully loaded local credentials for:', secretName);
      return credentials;
    }

    // In production, use Google Cloud Secret Manager
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT environment variable is not set');
    }

    // Map the internal secret name to the actual secret name in Secret Manager
    const actualSecretName = SECRET_NAME_MAP[secretName] || secretName;
    logger.debug(`Mapped secret name '${secretName}' to '${actualSecretName}'`);
    
    const name = `projects/${projectId}/secrets/${actualSecretName}/versions/latest`;
    logger.debug(`Fetching secret from Google Cloud: ${name}`);
    
    const [version] = await client.accessSecretVersion({
      name: name,
    });

    // Parse the secret payload as JSON
    const secretData = JSON.parse(version.payload.data.toString());
    logger.info('Successfully retrieved secret from Google Cloud');
    return secretData;
  } catch (error) {
    logger.error('Error retrieving secret:', { 
      error: error.message, 
      secretName,
      environment: process.env.NODE_ENV,
      stack: error.stack,
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      fullSecretPath: process.env.NODE_ENV === 'production' ? 
        `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/${secretName}/versions/latest` : 
        path.join(__dirname, '..', 'credentials', `${secretName}.json`),
      // Log additional details for debugging
      errorCode: error.code,
      errorDetails: error.details
    });
    throw error;
  }
}

module.exports = {
  getSecret
}; 