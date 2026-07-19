const OPENCODE_CONFIG_URL = 'http://127.0.0.1:4096/'
/** OpenCode top titlebar height (DEV + tabs, h-9) */
const OPENCODE_TITLEBAR_PX = 36

export function ConfigManagePage() {
  return (
    <div className="relative -m-4 h-[calc(100vh-4rem)] overflow-hidden lg:-m-6">
      {/* Crop OpenCode top titlebar (DEV / workspace / +) — no OpenCode code changes */}
      <iframe
        src={OPENCODE_CONFIG_URL}
        className="absolute left-0 w-full border-0"
        style={{
          top: -OPENCODE_TITLEBAR_PX,
          height: `calc(100% + ${OPENCODE_TITLEBAR_PX}px)`,
        }}
        title="OpenCode 配置管理"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  )
}
