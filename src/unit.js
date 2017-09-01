function findNode (tree, key, value) { // 通过属性查询节点
  let node = null
  if (Array.isArray(tree) && tree.length > 0) {
    for (let i = 0; i < tree.length; i++) {
      if (node) {
        break
      }
      node = tree[i][key] === value
        ? tree[i]
        : findNode(tree[i].nodes, key, value)
    }
  }
  return node
}

function findNodeById (tree, value) {
  const node = findNode(tree, 'id', value)
  return node
}
export default {
  findNodeById: findNodeById
}
