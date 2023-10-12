import { uuidv7, UUID } from 'uuidv7'

export const VERSION = 1;

export const ID = () => uuidv7()

export const getTimestamp = (id: string) => {
  const parsed = UUID.parse(id)
  return parsed
}

globalThis.UUID = UUID
