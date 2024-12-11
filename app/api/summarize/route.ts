// Import the OpenAI library to interact with the OpenAI API
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Initialize OpenAI client with configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Get the note content from the request body
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Call OpenAI API to generate summary
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes text concisely."
        },
        {
          role: "user",
          content: `Please summarize the following text in a brief paragraph: ${content}`
        }
      ],
      model: "gpt-3.5-turbo",
    });

    // Get the summary from the response
    const summary = completion.choices[0].message.content;

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('Error in summarize route:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}