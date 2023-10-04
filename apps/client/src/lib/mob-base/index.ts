import { types, ID, type IAnyModelType, type ModelPropertiesDeclaration, type IModelType } from 'mob-base'

/**
 * models require and id -> identifier
 */

const Entity = types.model('entity', {
  id: types.identifier,
})

type EntityModelBuilderFn = (t: typeof types) => ModelPropertiesDeclaration
function createEntityModel(buildFn: EntityModelBuilderFn) {
  return types.compose(Entity, types.model(buildFn(types)))
}
//
// const User = createEntityModel('User', (t) => ({
//   name: t.string,
// }))
// const Program = createEntityModel('Program', (t) => ({
//   name: t.string,
//   userId: t.reference(User)
// }))

const Table = types.model('table', {
  name: types.string,
  entities: types.map(Entity),
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
      create: (props: Record<string, unknown> & { id: string }) => {
        const id = ID()  
        props.id = id 
        self.entities.set(id, props)
      },
      remove: (id: string) => {
        self.entities.delete(id)
      }
    }
  })

function createTable(EntityModel: IAnyModelType) {
  const WrappedTable = types.model(Entity.name + 'Table', {
    entities: types.map(EntityModel)
  })
  return types.compose(Table, WrappedTable)
}

const GenericDatabase = types.model('GenericDatabase', {
  tables: types.map(Table),
  meta: types.frozen({
    version: types.number,
  })
})


const databaseBuilderUtils = {
  createTable,
  createEntityModel,
}

type AnyModelTypeMap = Record<string, IAnyModelType>
type DatabaseBuilderFn<T extends AnyModelTypeMap> = (t: typeof types, utils: typeof databaseBuilderUtils) => T
export function createDatabase<T extends AnyModelTypeMap>(buildFn: DatabaseBuilderFn<T>) {
  const modelMap = buildFn(types, databaseBuilderUtils)

  const tables = Object.keys(modelMap).reduce((acc, curr) => {
    const m = modelMap[curr].named(curr)
    acc[curr as keyof T] = createTable(m)
    return acc 
  }, {} as Record<keyof T, ReturnType<typeof createTable>>)

  const TablesModel = types.model('Tables', tables)
  const DatabaseModel = types.model('Database', {
    tables: TablesModel,
  })
  return types.compose(GenericDatabase, DatabaseModel)
}

const NewDatabase = createDatabase((t, u) => {

  const users = u.createEntityModel((t) => ({
    email: t.string,
    name: t.string,
  }))
  const products = u.createEntityModel((t) => ({
    name: t.string,
    userId: t.reference(users),
  }))

  return {
    users,
    products,
  }
})

const db = NewDatabase.create()

db.tables.
