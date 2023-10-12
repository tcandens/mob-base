import { MobBaseSocket } from './socket'
import { onPatch, onAction, getParent, getType, getChildType, unprotect, protect } from 'mobx-state-tree'
import { GenericDatabase, Table } from './models'
import type { IMSTMap, Instance } from 'mobx-state-tree'

export function sync<T extends IMSTMap<typeof Table>>(socket: MobBaseSocket, node: T) {

  const root = getParent(node) as Instance<typeof GenericDatabase>

  const allEntitiesSorted = root.allEntitiesSorted
  const lastEntity = allEntitiesSorted.at(-1)
  console.log('lastEntity', lastEntity, allEntitiesSorted)

  socket.connect()

  socket.emit('sync:init', {
    lastUpdate: lastEntity ? lastEntity.updatedAt : 0,
    tables: Object.keys(root.tables),
  })


  socket.on('sync:in', (data) => {
    for (const [table, items] of Object.entries(data.entities)) {
      const count = Object.keys(items).length
      if (count) {
        // turn off patch emission
        root.setStatus('pending')
        const existing = node[table]['entities'].toJSON()
        console.log('syncing in entities!', data.entities[table])
        unprotect(root)
        const next = {
          ...existing, 
          ...data.entities[table]
        }
        node[table]['entities'] = next
        protect(root)
        // turn on patch emission
        root.setStatus('ready')
      } else {
        console.log('nothing', items, table)
      }
      // if (data.entities[table]) {
      // }
    }
  })

  onPatch(node, (patch) => {
    if (root.status !== 'ready') return
    socket.emit('patch', patch)
  })
  onAction(node, (action) => {
    socket.emit('action', action)
  })
}

