import murmurhash from '@emotion/hash'

export class MerkleNode {
  left: MerkleNode
  right: MerkleNode
  hash: string
  constructor(left?: MerkleNode, right?: MerkleNode, hash?: string) {
    this.left = left
    this.right = right
    if (left && right) {
      this.hash = hash || murmurhash(left.hash + right.hash)
    } else {
      this.hash = null
    }
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

    this.root = nodes[0] ?? new MerkleNode()
  }

  insert(value: unknown) {

  }
}
