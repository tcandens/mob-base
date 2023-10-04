import { types, type ModelPropertiesDeclaration, ISimpleType } from 'mobx-state-tree'
import { nanoid } from 'nanoid'

export const VERSION = 1;

const m = types.model({
  name: types.string
})

export function createTable<T = {}>(model: any) {
  return m

}

type ModelDeclarationsMap = {
  [name: string]: ModelPropertiesDeclaration
}
type ModelDeclarationsMapBuilderFn = (t: typeof types) => ModelDeclarationsMap

export function createDatabase(modelBuilderFn: ModelDeclarationsMapBuilderFn) {
}

export const ID = nanoid

export { types, IAnyModelType, IModelType ModelPropertiesDeclaration } from 'mobx-state-tree'
