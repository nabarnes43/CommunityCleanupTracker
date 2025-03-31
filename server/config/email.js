/**
 * @fileoverview Email configuration for the Community Cleanup Tracker
 * Sets up OAuth2 client and email constants
 * @module config/email
 */

const { google } = require('googleapis');
const path = require('path');
const logger = require('../utils/logger');

/**
 * OAuth2 client credentials
 * @type {Object}
 */
const CREDENTIALS = {
  type: 'authorized_user',
  client_id: '/* CLIENT_ID_REMOVED */',  // Removed for security
  client_secret: '/* CLIENT_SECRET_REMOVED */',  // Removed for security
  refresh_token: '/* REFRESH_TOKEN_REMOVED */'  // Removed for security
};

/**
 * OAuth2 client scope for Gmail API
 * @type {Array<string>}
 */
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
];

/**
 * Email authentication configuration
 * @type {Object}
 */
const auth = {
  type: 'OAuth2',
  user: '/* EMAIL_REMOVED */',  // Removed for security
  clientId: CREDENTIALS.client_id,
  clientSecret: CREDENTIALS.client_secret,
  refreshToken: CREDENTIALS.refresh_token
};

/**
 * Default mail options for sending emails
 * @type {Object}
 */
const mailOptions = {
  from: 'Community Map Project </* EMAIL_REMOVED */>',  // Removed for security
  to: '/* EMAIL_REMOVED */',  // Removed for security
  subject: 'Test Email via Gmail API'
};
//TODO Make Templates of config code and a readme with instructions on how to use it. 
/**
 * OAuth2 client instance
 * @type {google.auth.OAuth2}
 */
const oAuth2Client = new google.auth.OAuth2(
  auth.clientId,
  auth.clientSecret,
  'https://developers.google.com/oauthplayground'
);

oAuth2Client.setCredentials({
  refresh_token: auth.refreshToken
});

// Constants for email configuration
const CONSTANTS = {
  auth,
  mailOptions
};

logger.info('Email configuration initialized');

module.exports = {
  oAuth2Client,
  CONSTANTS
}; 