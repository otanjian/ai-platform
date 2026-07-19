export function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">企业AI智造平台</h1>
        <p className="mb-6 text-center text-sm text-slate-500">使用 Keycloak 统一身份认证</p>
        <a
          href="/login"
          className="block w-full rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700"
        >
          使用 Keycloak 登录
        </a>
      </div>
    </div>
  )
}
