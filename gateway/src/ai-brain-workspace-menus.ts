/**
 * AI Brain L2 menus from BuildingAI default nav red-box items:
 * 对话 / AI 应用 / 历史记录（与智能体、知识库、设置并列）
 */
export type FlatMenuItem = {
  code: string
  label: string
  icon: string
  path: string
  parent: string | null
  sort: number
}

export const AI_BRAIN_WORKSPACE_MENU_ITEMS: FlatMenuItem[] = [
  {
    code: "ai_brain.chat",
    label: "对话",
    icon: "SquarePen",
    path: "/ai-brain/chat",
    parent: "ai_brain",
    sort: 1,
  },
  {
    code: "ai_brain.apps",
    label: "AI 应用",
    icon: "LayoutGrid",
    path: "/ai-brain/apps",
    parent: "ai_brain",
    sort: 2,
  },
  {
    code: "ai_brain.history",
    label: "历史记录",
    icon: "History",
    path: "/ai-brain/history",
    parent: "ai_brain",
    sort: 5,
  },
]

/** Platform workspace leaf → BuildingAI URL (path + query, without _embed). */
export function platformWorkspacePathToBuildingAiUrl(platformPath: string): string | null {
  switch (platformPath) {
    case "/ai-brain/chat":
      return "/"
    case "/ai-brain/apps":
      return "/apps"
    case "/ai-brain/history":
      return "/?_history=1"
    default:
      return null
  }
}
