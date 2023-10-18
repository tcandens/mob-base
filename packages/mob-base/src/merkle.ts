// import murmurhash from 'murmur-32'
import { murmurHash as murmurhash } from 'ohash'

export class MerkleNode {
  left: MerkleNode
  right: MerkleNode
  hash: string | number
  constructor(left?: MerkleNode, right?: MerkleNode, hash?: string) {
    this.left = left
    this.right = right
    this.hash = hash || murmurhash(String(left.hash) + String(right.hash))
  }

  static leaf(hash: string | unknown) {
    const node = new MerkleNode()
    node.hash = String(hash)
    return node
  }
}

export class MerkleTrie {
  root: MerkleNode

  constructor(values: unknown[]) {
    const nodes = values.map(value => {
      let hash = murmurhash(
        typeof value === 'object' 
        ? JSON.stringify(value)
        : String(value)
      )
      return MerkleNode.leaf(hash)
    })

    this.root = this.build(nodes)
  }

  build(leaves: MerkleNode[]): MerkleNode {
    if (leaves.length === 1) {
      return leaves[0]
    }

    const nodes = [] as MerkleNode[]
    for (let i = 0; i < leaves.length; i+=2) {
      const leftLeaf = leaves[i]
      const rightLeaf = leaves[i + 1]
      const left = MerkleNode.leaf(leftLeaf)
      const right = MerkleNode.leaf(rightLeaf || leftLeaf)
      const node = new MerkleNode(left, right)
      nodes.push(node)
    }

    return this.build(nodes)
  }

  insert(value: unknown) {

  }
}
