# **App Name**: AlphaLink v2

## Core Features:

- Secure Access & Role Management: Users can log in using unique access codes, which determine their role as either 'admin' or 'member'. This uses custom authentication against Firestore data.
- Admin Invite Management: Admins can generate new, unique invitation codes, list existing invites with their status, disable them, and track usage.
- Unified Trade Idea Feed: Displays a feed of both stock and options trade ideas. Members can view these ideas, while admins can post new ones. Users can interact via likes and comments.
- Admin Trade Idea Submission: Admins have dedicated panels to create and submit detailed stock and options trade ideas, including specific financial metrics and plans.
- AI Trade Idea Summarization: Utilizes the Gemini API via Cloud Functions to automatically generate concise bullet-point summaries, risk lines, and payoff hints for newly submitted trade ideas, including disclaimers.
- AlphaBot AI Chat Assistant: Provides a dedicated chat interface where users can interact with an AI assistant (AlphaBot) powered by the Gemini API via Cloud Functions, complete with chat history.
- Performance Highlights Management: Allows administrators to create, read, update, and delete entries detailing performance highlights, including relevant metrics and optional screenshots.

## Style Guidelines:

- Overall color scheme is dark, reflecting a professional finance terminal aesthetic. The background is a very dark, desaturated blue-gray (#161B1D). The primary interactive color is a clean cyan-blue (#26A9DB) for buttons and active states. An accent green (#38EB7F) is used for positive indicators or highlights.
- Headlines use 'Space Grotesk' (sans-serif) for a modern, techy feel, while body text and detailed content utilize 'Inter' (sans-serif) for readability and a neutral, objective presentation.
- Clean, minimalist outline-style icons are used throughout the application to maintain a sleek, data-focused aesthetic.
- A card-based layout with generous premium spacing for clear data separation. Trade idea cards are designed for optimal screen-recording readability, featuring large tickers and distinct action badges.
- Subtle and functional animations are employed, primarily for loading indicators, async action feedback (toast errors), and smooth transitions to enhance the user experience without distraction.