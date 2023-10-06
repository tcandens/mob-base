import { MobBaseSocket } from './socket'
import { onPatch, onAction } from 'mobx-state-tree'
import { Table } from './models'
import type { IMSTMap } from 'mobx-state-tree'

export function sync<T extends IMSTMap<typeof Table>>(socket: MobBaseSocket, node: T) {
  onPatch(node, (patch) => {
    socket.emit('patch', patch)
  })
  onAction(node, (action) => {
    socket.emit('action', action)
  })
}

