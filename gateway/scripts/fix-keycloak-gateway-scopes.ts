/**
 * Ensure Keycloak gateway client has profile/email scopes so OIDC
 * preferred_username is available for subsystem SSO (TaskView/Superset/BuildingAI).
 *
 * Usage: bun run scripts/fix-keycloak-gateway-scopes.ts
 */
const KC = process.env.KEYCLOAK_URL || "http://localhost:8080"
const REALM = process.env.KEYCLOAK_REALM || "aiplatform"
const ADMIN_USER = process.env.KEYCLOAK_ADMIN || "admin"
const ADMIN_PASS = process.env.KEYCLOAK_ADMIN_PASSWORD || "admin"
const CLIENT_ID = process.env.KEYCLOAK_GATEWAY_CLIENT || "gateway"

async function adminToken(): Promise<string> {
  const body = new URLSearchParams({
    client_id: "admin-cli",
    username: ADMIN_USER,
    password: ADMIN_PASS,
    grant_type: "password",
  })
  const res = await fetch(`${KC}/realms/master/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  if (!res.ok) throw new Error(`admin token failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

async function kc(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${KC}/admin/realms/${REALM}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  })
  return res
}

async function ensureClientScope(
  token: string,
  name: string,
  mappers: Array<Record<string, unknown>>,
): Promise<string> {
  const listRes = await kc(token, "/client-scopes")
  const scopes = (await listRes.json()) as Array<{ id: string; name: string }>
  let scope = scopes.find((s) => s.name === name)
  if (!scope) {
    const create = await kc(token, "/client-scopes", {
      method: "POST",
      body: JSON.stringify({
        name,
        protocol: "openid-connect",
        attributes: {
          "include.in.token.scope": "true",
          "display.on.consent.screen": "true",
        },
      }),
    })
    if (!create.ok && create.status !== 409) {
      throw new Error(`create scope ${name}: ${create.status} ${await create.text()}`)
    }
    const list2 = (await (await kc(token, "/client-scopes")).json()) as Array<{ id: string; name: string }>
    scope = list2.find((s) => s.name === name)
    if (!scope) throw new Error(`scope ${name} not found after create`)
    console.log(`created client scope: ${name}`)
  } else {
    console.log(`client scope exists: ${name}`)
  }

  const mappersRes = await kc(token, `/client-scopes/${scope.id}/protocol-mappers/models`)
  const existing = (await mappersRes.json()) as Array<{ name: string }>
  for (const mapper of mappers) {
    const mapperName = String(mapper.name)
    if (existing.some((m) => m.name === mapperName)) {
      console.log(`  mapper exists: ${mapperName}`)
      continue
    }
    const add = await kc(token, `/client-scopes/${scope.id}/protocol-mappers/models`, {
      method: "POST",
      body: JSON.stringify(mapper),
    })
    if (!add.ok) throw new Error(`add mapper ${mapperName}: ${add.status} ${await add.text()}`)
    console.log(`  added mapper: ${mapperName}`)
  }
  return scope.id
}

async function ensureDefaultScope(token: string, clientUuid: string, scopeId: string, scopeName: string) {
  const defaults = (await (
    await kc(token, `/clients/${clientUuid}/default-client-scopes`)
  ).json()) as Array<{ id: string; name: string }>
  if (defaults.some((s) => s.id === scopeId || s.name === scopeName)) {
    console.log(`gateway already has default scope: ${scopeName}`)
    return
  }
  const res = await kc(token, `/clients/${clientUuid}/default-client-scopes/${scopeId}`, {
    method: "PUT",
  })
  if (!res.ok) throw new Error(`attach ${scopeName}: ${res.status} ${await res.text()}`)
  console.log(`attached default scope to gateway: ${scopeName}`)
}

async function main() {
  const token = await adminToken()
  const clients = (await (await kc(token, `/clients?clientId=${CLIENT_ID}`)).json()) as Array<{
    id: string
    clientId: string
  }>
  const client = clients[0]
  if (!client) throw new Error(`client ${CLIENT_ID} not found`)

  const profileId = await ensureClientScope(token, "profile", [
    {
      name: "username",
      protocol: "openid-connect",
      protocolMapper: "oidc-usermodel-property-mapper",
      consentRequired: false,
      config: {
        "user.attribute": "username",
        "claim.name": "preferred_username",
        "jsonType.label": "String",
        "id.token.claim": "true",
        "access.token.claim": "true",
        "userinfo.token.claim": "true",
      },
    },
    {
      name: "full name",
      protocol: "openid-connect",
      protocolMapper: "oidc-full-name-mapper",
      consentRequired: false,
      config: {
        "id.token.claim": "true",
        "access.token.claim": "true",
        "userinfo.token.claim": "true",
      },
    },
  ])

  const emailId = await ensureClientScope(token, "email", [
    {
      name: "email",
      protocol: "openid-connect",
      protocolMapper: "oidc-usermodel-property-mapper",
      consentRequired: false,
      config: {
        "user.attribute": "email",
        "claim.name": "email",
        "jsonType.label": "String",
        "id.token.claim": "true",
        "access.token.claim": "true",
        "userinfo.token.claim": "true",
      },
    },
  ])

  await ensureDefaultScope(token, client.id, profileId, "profile")
  await ensureDefaultScope(token, client.id, emailId, "email")

  // Verify token now includes preferred_username
  const tokRes = await fetch(`${KC}/realms/${REALM}/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      username: "admin",
      password: "admin",
      grant_type: "password",
      scope: "openid",
    }),
  })
  const tok = (await tokRes.json()) as { access_token?: string; error?: string }
  if (!tok.access_token) {
    console.warn("verify token skipped:", tok.error)
    return
  }
  const payload = JSON.parse(Buffer.from(tok.access_token.split(".")[1], "base64url").toString())
  console.log("verify preferred_username:", payload.preferred_username || "(missing)")
  console.log("verify sub:", payload.sub || "(missing)")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
