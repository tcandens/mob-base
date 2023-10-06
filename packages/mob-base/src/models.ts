import { types } from 'mobx-state-tree'
import type { IAnyModelType, Instance, IModelType, IAnyType } from 'mobx-state-tree'
import { Socket } from './socket'
import { sync } from './sync'
import { ID } from './utils'

export const Entity = types.model({
  id: types.identifier,
})

export interface ModelProperties {
    [key: string]: IAnyType;
}

function modelEntity<P extends ModelProperties>(props: P) {
  const Inter = types.model(props)
  return types.compose(Inter, Entity)
}

export const Table = types.model({
  entities: types.map(Entity),
})

function createTableFromEntity<P extends ModelProperties, A extends Object = {}, S extends Object = {}, O extends Object = {}>(EntityModel: IModelType<P, A, S, O>) {
  const Building = types.model({
    entities: types.map(EntityModel)
  })
    .views((self) => {
      return {
        get list() {
          return Array.from(self.entities.values())
        }
      }
    })
    .actions((self) => {
      return {
        create: (props: {[R in keyof P as Exclude<R, "id">]: Instance<P[R]>}) => {
          console.log('props on create', props)
          const id = ID()
          self.entities.set(id, { ...props, id } as any)
        },
        remove: (id: Instance<P['id']>) => {
          self.entities.delete(id)
        }
      }
    })

  return types.compose(Table, Building)
}

export const GenericDatabase = types.model({
  tables: types.optional(types.map(Table), {}),
  socket: Socket,
  meta: types.frozen({
    version: types.number,
  })
})

const databaseBuilderUtils = {
  entity: modelEntity,
}

type AnyModelTypeMap<T extends IAnyModelType = IAnyModelType> = Record<string, T>
type DatabaseBuilderFn<T extends AnyModelTypeMap> = (t: typeof types, utils: typeof databaseBuilderUtils) => T

export function modelDatabase<T extends AnyModelTypeMap>(buildFn: DatabaseBuilderFn<T>) {
  const built = buildFn(types, databaseBuilderUtils)
  const tables = Object.keys(built).reduce((acc, curr) => {
    const entity = built[curr]
    acc[curr] = createTableFromEntity(entity)
    return acc
  }, {})

  const TablesModel = types.model(tables as {[K in keyof T]: ReturnType<typeof createTableFromEntity<T[K]['properties']>>})
  // return TablesModel
  const defaultTables = Object.keys(tables).reduce((acc, curr) => {
    acc[curr] = {entities: {}}
    return acc
  }, {})
  const DatabaseModel = types.model({
    tables: types.optional(TablesModel, defaultTables as any),
  })

  const ComposedDatabase = types.compose(GenericDatabase, DatabaseModel)
    .extend((self) => {
      return {
        actions: {
          afterCreate() {
            sync(self.socket.transport, self.tables)
          }
        } 
      }
    })

  return ComposedDatabase
}



