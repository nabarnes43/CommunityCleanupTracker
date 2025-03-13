/**
 * @fileoverview Email controller handling email-related operations
 * This module provides functions for sending and retrieving emails
 * @module controllers/emailController
 */

const nodemailer = require('nodemailer');
const axios = require('axios');
const { oAuth2Client, CONSTANTS } = require('../config');
const logger = require('../utils/logger');

/**
 * Creates a configuration object for axios requests
 * @function createConfig
 * @param {string} url - API endpoint URL
 * @param {string} token - OAuth access token
 * @returns {Object} - Axios configuration object
 */
const createConfig = (url, token) => {
  return {
    method: 'get',
    url: url,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-type': 'application/json'
    }
  };
};

/**
 * Send a test email using Gmail API
 * @async
 * @function sendMail
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function sendMail(req, res) {
  const reqLogger = req.logger || logger;
  
  try {
    reqLogger.info('Sending test email');
    
    const accessToken = await oAuth2Client.getAccessToken();
    let token = await accessToken.token;

    reqLogger.debug('Retrieved access token for email sending');

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        ...CONSTANTS.auth,
        accessToken: token,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      ...CONSTANTS.mailOptions,
      text: 'This is a test mail using Gmail API'
    };

    reqLogger.debug('Sending mail with options', { 
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const result = await transport.sendMail(mailOptions);
    
    reqLogger.info('Email sent successfully', { 
      messageId: result.messageId,
      response: result.response
    });
    
    res.send(result);
  } catch (error) {
    reqLogger.error('Failed to send email', { 
      error: error.message, 
      stack: error.stack 
    });
    
    res.status(500).send({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
}

/**
 * Retrieve emails for a specific address using Gmail API
 * @async
 * @function getMails
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.email - Email address to fetch mails for
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function getMails(req, res) {
  const reqLogger = req.logger || logger;
  const email = req.params.email;
  
  try {
    reqLogger.info(`Fetching emails for ${email}`);
    
    const url = `https://gmail.googleapis.com/gmail/v1/users/${email}/threads?maxResults=100`;
    
    reqLogger.debug('Getting access token for Gmail API');
    const { token } = await oAuth2Client.getAccessToken();
    
    const config = createConfig(url, token);
    
    reqLogger.debug('Making request to Gmail API', { url });
    const response = await axios(config);
    
    reqLogger.info(`Retrieved ${response.data.threads?.length || 0} email threads`);
    res.json(response.data);
  } catch (error) {
    reqLogger.error('Failed to retrieve emails', { 
      email,
      error: error.message, 
      stack: error.stack 
    });
    
    res.status(500).send({ 
      error: 'Failed to retrieve emails', 
      details: error.message 
    });
  }
}

module.exports = {
  sendMail,
  getMails
}; 