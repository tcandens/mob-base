import { onSnapshot, applySnapshot, applyAction } from 'mobx-state-tree'
import localforage from 'localforage'
import type { IStateTreeNode, Instance } from 'mobx-state-tree'
import { GenericDatabase } from './models'

export const storage = localforage.createInstance({
  name: 'mob-base',
  driver: localforage.INDEXEDDB,
})

export async function persist<T extends Instance<typeof GenericDatabase>>(node: T) {
  if (node.status === 'ready')
    node.setStatus('pending')
    // make sure we block on hydrating state BEFORE we start syncing on patch events
    await storage.getItem('state', (err, state) => {
      if (err) console.log('error', err)
      if (state) {
        try {
          applySnapshot(node, state)
        } catch (e) {
          console.error(e)
        }
      }
      node.setStatus('ready')
    })

  const dispose = onSnapshot(node, (snap) => {
    storage.setItem('state', snap)
  })

  return dispose
}
