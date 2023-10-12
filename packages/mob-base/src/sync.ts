import { MobBaseSocket } from './socket'
import { onPatch, onAction, getParent, getType } from 'mobx-state-tree'
import { GenericDatabase, Table } from './models'
import type { IMSTMap, Instance } from 'mobx-state-tree'

export function sync<T extends IMSTMap<typeof Table>>(socket: MobBaseSocket, node: T) {

  const root = getParent(node) as Instance<typeof GenericDatabase>
  console.log(root)

  socket.emit('sync:init', {
    tables: node,
  })

  onPatch(node, (patch) => {
    socket.emit('patch', patch)
  })
  onAction(node, (action) => {
    socket.emit('action', action)
  })
}

