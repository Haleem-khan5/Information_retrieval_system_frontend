// Configuration file for the frontend application

// Server Configuration
export const SERVER_LINK = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// AWS Configuration
export const AWS_CONFIG = {
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_S3_REGION,
  bucket: process.env.REACT_APP_AWS_BUCKET_NAME
}; 


