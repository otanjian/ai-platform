import { BuildingAiAdminClient, isValidBuildingAiPassword, normalizeBuildingAiUsername } from "./buildingai-admin.js"
import type { GatewayConfig } from "./types.js"

export { isValidBuildingAiPassword, normalizeBuildingAiUsername }

export function createBuildingAiAdminClient(config: GatewayConfig): BuildingAiAdminClient | null {
  const bai = config.subsystems.buildingai
  if (!bai.adminUsername || !bai.adminPassword || !bai.apiBaseUrl) {
    return null
  }
  return new BuildingAiAdminClient({
    apiBaseUrl: bai.apiBaseUrl,
    adminUsername: bai.adminUsername,
    adminPassword: bai.adminPassword,
  })
}

export type BuildingAiSyncResult =
  | { ok: true; action: "created" | "password_reset"; username: string }
  | { ok: false; error: string }

/** Sync username/password to BuildingAI; never throws — caller keeps Keycloak result. */
export async function syncUserToBuildingAi(
  config: GatewayConfig,
  input: { username: string; password: string; email?: string; nickname?: string },
): Promise<BuildingAiSyncResult> {
  if (!isValidBuildingAiPassword(input.password)) {
    return {
      ok: false,
      error: "密码须为 6–20 位且同时包含字母和数字（BuildingAI 规则）",
    }
  }
  const client = createBuildingAiAdminClient(config)
  if (!client) {
    return { ok: false, error: "BuildingAI admin credentials are not configured" }
  }
  const username = normalizeBuildingAiUsername(input.username)
  try {
    const result = await client.syncUserCredentials({
      ...input,
      username,
      nickname: input.nickname || username,
    })
    return { ok: true, action: result.action, username }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
