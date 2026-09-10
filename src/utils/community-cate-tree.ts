import type { ICommunityCateTreeNode } from '@/services/api/community-cate.api'

export interface CatePathNode {
  uniqueCode: string
  name: string
}

/** 在分类树中查找节点路径(根 → 当前),找不到返回空数组 */
export function findCatePath(
  tree: ICommunityCateTreeNode[] | undefined | null,
  code: string | undefined | null,
): CatePathNode[] {
  if (!tree?.length || !code)
    return []

  function walk(nodes: ICommunityCateTreeNode[], trail: CatePathNode[]): CatePathNode[] | null {
    for (const node of nodes) {
      const next = [...trail, { uniqueCode: node.uniqueCode, name: node.name }]
      if (node.uniqueCode === code)
        return next
      if (node.children?.length) {
        const found = walk(node.children, next)
        if (found)
          return found
      }
    }
    return null
  }

  return walk(tree, []) ?? []
}

/** 路径展示:一级 / 二级 */
export function formatCatePathLabel(path: CatePathNode[]): string {
  return path.map(node => node.name).filter(Boolean).join(' / ')
}

export function isCateLeaf(node: ICommunityCateTreeNode | undefined | null): boolean {
  return !!node && !node.children?.length
}
