import { NextResponse } from 'next/server';

export async function GET() {
  // This is just to test - we'll remove this file later
  const apiKeyExists = !!process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    success: apiKeyExists,
    message: apiKeyExists 
      ? 'API key is configured' 
      : 'API key is missing'
  });
}