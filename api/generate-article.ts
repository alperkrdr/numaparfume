import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GeminiService } from '../src/services/geminiService';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Protect the endpoint with a secret stored in environment variables
  const cronSecret = process.env.CRON_SECRET;
  
  // The secret can be passed in the authorization header or as a query parameter
  const authHeader = request.headers['authorization'];
  const secretFromQuery = request.query['secret'];

  const isAuthorized = 
    (authHeader && authHeader === `Bearer ${cronSecret}`) || 
    (secretFromQuery && secretFromQuery === cronSecret);

  if (!cronSecret || !isAuthorized) {
    return response.status(401).json({ message: 'Unauthorized' });
  }

  try {
    console.log('API endpoint triggered: Starting daily article generation...');
    const postId = await GeminiService.generateAndSaveArticle();
    console.log(`API endpoint success: Article ${postId} generated and saved.`);
    return response.status(200).json({ success: true, postId });
  } catch (error) {
    console.error('API endpoint error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return response.status(500).json({ success: false, message: errorMessage });
  }
} 