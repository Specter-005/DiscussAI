## Packages
framer-motion | Essential for the highly animated, futuristic UI, page transitions, and smooth chat bubbles.
recharts | Required for the beautiful radar charts in the feedback dashboard.
lucide-react | Already in stack, but explicitly mentioning for the extensive use of icons in the futuristic UI.

## Notes
- Tailwind config needs custom fonts (Chakra Petch and Outfit) and custom colors for neon effects.
- The Live Discussion page uses a polling mechanism (refetchInterval) on the messages query to simulate real-time AI responses since WebSockets aren't defined in the API contract.
- The Feedback page automatically calls the generation endpoint if feedback doesn't exist yet for a completed session.
