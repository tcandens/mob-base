import { types } from 'mobx-state-tree'
import { Socket } from './socket'
import { sync } from './sync'
import { persist } from './persist'
import { nanoid } from 'nanoid'
import type { IAnyModelType, Instance, IModelType, IAnyType } from 'mobx-state-tree'

export const Entity = types.model({
  id: types.identifier,
  updatedAt: types.optional(types.number, () => Date.now()),
  tombstoned: types.optional(types.boolean, false),
})

export interface ModelProperties {
    [key: string]: IAnyType;
}

export function modelEntity<P extends ModelProperties>(props: P) {
  const Inter = types.model(props)
  return types.compose(Inter, Entity)
}

export const Table = types.model({
  entities: types.map(Entity),
})

type EntityType = Instance<typeof Entity>

function createTableFromEntity<P extends EntityType & ModelProperties, A extends Object = {}, S extends Object = {}, O extends Object = {}>(EntityModel: IModelType<P, A, S, O>) {
  const Building = types.model({
    entities: types.map(EntityModel)
  })
    .views((self) => {
      return {
        get list() {
          return Array.from(self.entities.values()).filter(e => !e.tombstoned)
        }
      }
    })
    .actions((self) => {
      return {
        create: (props: {[R in keyof P as Exclude<R, "id">]: Instance<P[R]>}) => {
          const id = nanoid()
          self.entities.set(id, { ...props, id } as any)
        },
        delete: (id: Instance<P['id']>) => {
          const prev = self.entities.get(id)
          if (prev) {
            self.entities.set(id, {
              ...prev,
              tombstoned: true,
              updatedAt: Date.now(),
            })
          }
        },
        update: (id: Instance<P['id']>, props: {[R in keyof P as Exclude<R, "id">]: Instance<P[R]>}) => {
          const prev = self.entities.get(id)
          if (prev) {
            self.entities.set(id, {...prev, ...props, updatedAt: Date.now()})
          }
        },
        read: (id: Instance<P['id']>) => {
          return self.entities.get(id)
        },
        query: (queryFn: (q: { where: any }) => typeof self.list) => {
          return queryFn({ where: {} })
        }
      }
    })

  return types.compose(Table, Building).named(`${EntityModel.name}Table`)
}

export const GenericDatabase = types.model({
  tables: types.optional(types.map(Table), {}),
  socket: Socket,
  meta: types.optional(types.model({
    nodeId: types.optional(types.string, () => nanoid()),
    version: types.optional(types.number, 0),
    mode: types.enumeration(['persistent', 'transient']),
  }), {
    nodeId: nanoid(),
    version: 0,
    mode: 'transient',
  })
})
  .volatile((self) => ({
    status: self.meta.mode === 'persistent' ? 'pending' : 'ready',
  }))
  .views((self) => {
    return {
      get allEntitiesSorted() {
        const entities = [] as Array<Instance<typeof Entity>>
        for (const table of Object.values(self.tables)) {
          // make sure we include all entities and not the list view filtering tombstoned
          for (const entity of table.entities.values()) {
            entities.push(entity)
          }
        }

        entities.sort((a, z) => {
          if (a.updatedAt < z.updatedAt) return -1
          if (a.updatedAt > z.updatedAt) return 1
        })

        return entities
      }
    }
  })
  .actions((self) => ({
    setStatus(val: 'ready' | 'pending') {
      self.status = val
    },
    setMode(mode: 'persistent' | 'transient') {
      self.meta.mode = mode
    },
    resetNodeId() {
      self.meta.nodeId = nanoid()
    }
  }))

const databaseBuilderUtils = {
  entity: modelEntity,
}

type AnyModelTypeMap<T extends IAnyModelType = IAnyModelType> = Record<string, T>
type DatabaseBuilderFn<T extends AnyModelTypeMap> = (t: typeof types, utils: typeof databaseBuilderUtils) => T

export function modelDatabase<T extends AnyModelTypeMap>(buildFn: DatabaseBuilderFn<T>) {
  const built = buildFn(types, databaseBuilderUtils)
  const tables = Object.keys(built).reduce((acc, curr) => {
    const entity = built[curr]
    acc[curr] = createTableFromEntity(entity.named(curr))
    return acc
  }, {})

  const TablesModel = types.model(tables as {[K in keyof T]: ReturnType<typeof createTableFromEntity<T[K]['properties']>>})
  const defaultTables = Object.keys(tables).reduce((acc, curr) => {
    acc[curr] = {entities: {}}
    return acc
  }, {})
  const DatabaseModel = types.model({
    tables: types.optional(TablesModel, defaultTables as any),
  })

  const ComposedDatabase = types.compose(GenericDatabase, DatabaseModel)
    .named('MSTDatabase')
    .extend((self) => {
      let persist_dispose: (() => void) | undefined

      function setupSync() {
        sync(self.socket.transport, self.tables)
      }

      return {
        actions: {
          afterCreate() {
            if (self.meta.mode === 'persistent') {
              persist(self)
                .then((disposer) => {
                  persist_dispose = disposer
                  setupSync()
                })
            } else {
              setupSync()
            }
          }
        } 
      }
    })

  return ComposedDatabase
}



