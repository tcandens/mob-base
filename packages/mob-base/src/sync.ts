import { MobBaseSocket } from './socket'
import { onPatch, onAction, getParent, getType, getChildType, unprotect, protect } from 'mobx-state-tree'
import { GenericDatabase, Table } from './models'
import type { IMSTMap, Instance } from 'mobx-state-tree'

export function sync<T extends IMSTMap<typeof Table>>(socket: MobBaseSocket, node: T) {

  const root = getParent(node) as Instance<typeof GenericDatabase>

  const lastEntity = root.allEntitiesSorted.at(0)

  socket.emit('sync:init', {
    lastUpdate: lastEntity ? lastEntity.updatedAt : 0,
    tables: Object.keys(root.tables),
  })


  socket.on('sync:in', (data) => {
    for (const [table, items] of Object.entries(data.entities)) {
      const count = Object.keys(items).length
      if (count) {
        const existing = node[table]['entities']
        unprotect(root)
        node[table]['entities'] = data.entities[table]
        protect(root)
      } else {
        console.log('nothing', items, table)
      }
      // if (data.entities[table]) {
      // }
    }
  })

  onPatch(node, (patch) => {
    socket.emit('patch', patch)
  })
  onAction(node, (action) => {
    socket.emit('action', action)
  })
}

