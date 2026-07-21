/**
 * AI Brain「知识库」三级菜单：知识库 → 叶子（对应 BuildingAI /datasets 红框导航）
 */
export type FlatMenuItem = {
  code: string
  label: string
  icon: string
  path: string
  parent: string | null
  sort: number
}

export const AI_BRAIN_KNOWLEDGE_MENU_ITEMS: FlatMenuItem[] = [
  {
    code: "ai_brain.knowledge.plaza",
    label: "知识广场",
    icon: "Library",
    path: "/ai-brain/knowledge/plaza",
    parent: "ai_brain.knowledge",
    sort: 1,
  },
  {
    code: "ai_brain.knowledge.mine",
    label: "我的知识库",
    icon: "BookCopy",
    path: "/ai-brain/knowledge/mine",
    parent: "ai_brain.knowledge",
    sort: 2,
  },
  {
    code: "ai_brain.knowledge.team",
    label: "团队知识库",
    icon: "Users",
    path: "/ai-brain/knowledge/team",
    parent: "ai_brain.knowledge",
    sort: 3,
  },
  {
    code: "ai_brain.knowledge.create",
    label: "创建知识库",
    icon: "Plus",
    path: "/ai-brain/knowledge/create",
    parent: "ai_brain.knowledge",
    sort: 4,
  },
]

/** Platform knowledge leaf → BuildingAI /datasets URL (path + query). */
export function platformKnowledgePathToDatasetsUrl(platformPath: string): string | null {
  switch (platformPath) {
    case "/ai-brain/knowledge":
    case "/ai-brain/knowledge/plaza":
      return "/datasets"
    case "/ai-brain/knowledge/mine":
      return "/datasets?scope=mine"
    case "/ai-brain/knowledge/team":
      return "/datasets?scope=team"
    case "/ai-brain/knowledge/create":
      return "/datasets?create=1"
    default:
      return null
  }
}
