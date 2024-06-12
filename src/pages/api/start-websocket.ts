// src/pages/api/start-websocket.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { server } from '../../server/websocketServer';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Ensure the server is started
    if (!server.listening) {
      server.listen(process.env.PORT || 8080, () => {
        console.log('Server started');
      });
    }
    res.status(200).json({ message: 'WebSocket server started' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
