import { randomUUID } from 'node:crypto'
import type { Response } from 'express'

type Client = {
  id: string
  res: Response
}

const clients = new Set<Client>()

export function subscribe(res: Response) {
  const client: Client = { id: randomUUID(), res }
  clients.add(client)
  res.on('close', () => clients.delete(client))
}

export function broadcast(data: unknown) {
  const payload = `data: ${JSON.stringify(data)}\n\n`
  for (const client of clients) {
    client.res.write(payload)
  }
}
