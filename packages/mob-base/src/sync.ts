import { MobBaseSocket } from './socket'
import { types, onPatch, applySnapshot, applyPatch, onAction, onSnapshot, getParent, unprotect, protect } from 'mobx-state-tree'
import { GenericDatabase, Table } from './models'
import { uuidv7 } from 'uuidv7'
import { storage } from './persist'
import { MerkleTrie } from './merkle'
import type { IMSTMap, Instance, IJsonPatch, SnapshotOut } from 'mobx-state-tree'

interface IPatch extends IJsonPatch {
  id: string
}

const PatchStore = types.model({
  patches: types.array(types.frozen<IPatch>()),
})
  .volatile((self) => ({
    merkle: new MerkleTrie(self.patches),
  }))
  .actions((self) => {
    return {
      insert(patch: IJsonPatch) {
        const patchOut = Object.assign({}, patch, {
          id: uuidv7(),
        })
        self.patches.push(patchOut)
        self.merkle.insert(patch)
      }
    }
  })
  .views((self) => {
    return {
      get hash() {
        return self.merkle.root?.hash
      },
      get lastPatchId() {
        return self.patches[self.patches.length - 1]?.id
      }
    }
  })

export function sync<T extends IMSTMap<typeof Table>>(socket: MobBaseSocket, node: T) {
  socket.connect()

  const root = getParent(node) as Instance<typeof GenericDatabase>
  const patchStore = PatchStore.create()

  storage.getItem<SnapshotOut<typeof PatchStore> | undefined>('patches', (err, value) => {
    if (err) console.error(err)

    if (value) {
      applySnapshot(patchStore, value)
    }

    socket.emit('sync:pull', {
      lastPatchId: patchStore.lastPatchId,
      hash: patchStore.merkle.root?.hash,
    })
  })

  socket.on('sync:push', (data) => {
    if (Array.isArray(data.patches) && data.patches.length > 0) {
      root.setStatus('pending')
      for (let i = 0; i < data.patches.length; i++) {
        const patch = data.patches[i]
        applyPatch(node, patch)
      }
      root.setStatus('pending')
    }
  })

  onPatch(node, (patch) => {
    patchStore.insert(patch)

    if (root.status !== 'ready') return
    socket.emit('patch:out', patch)
  })

}

