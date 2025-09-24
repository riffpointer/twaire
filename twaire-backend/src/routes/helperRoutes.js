/**
 * Some helper APIs e.g placeholder generation etc.
 */

// Import necessary modules using ES6 syntax
import { Router } from 'express';
import { createCanvas } from 'canvas';

const helperRouter = Router();

/**
 * API route to generate a placeholder image.
 *
 * Route format: /api/placeholder/:widthx:height
 * Query parameters:
 * - text: The text to display on the image. Defaults to dimensions.
 * - bgColor: The background color in hexadecimal (e.g., 'f0f0f0').
 * - textColor: The text color in hexadecimal (e.g., '333333').
 */
helperRouter.get('/placeholder/:dimensions', (req, res) => {
  // Parse dimensions from the URL parameter
  const [width, height] = req.params.dimensions.split('x').map(Number);
  
  // Validate dimensions
  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    return res.status(400).send('Invalid dimensions. Please use the format WIDTHxHEIGHT, e.g., 200x100');
  }

  // Get query parameters with default values
  const text = req.query.text || `${width}x${height}`;
  const bgColor = `#${req.query.bgColor || 'f0f0f0'}`;
  const textColor = `#${req.query.textColor || '333333'}`;
  
  // Create a new canvas with the specified dimensions
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill the background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Set text properties
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Calculate font size to fit the text
  const fontSize = Math.max(10 - (text.length / 8), Math.min(width, height) / 2);
  ctx.font = `${fontSize}px Arial`;

  // Draw the text in the center
  ctx.fillText(text, width / 2, height / 2);

  // Set the response headers for a PNG image
  res.setHeader('Content-Type', 'image/png');
  // res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  res.setHeader('Cache-Control', 'public, max-age=0'); // Cache for 1 year
  
  // Stream the canvas as a PNG image to the response
  canvas.createPNGStream().pipe(res);
});

export default helperRouter;