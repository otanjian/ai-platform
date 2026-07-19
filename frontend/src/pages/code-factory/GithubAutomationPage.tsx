import { useCallback, useEffect, useState } from 'react'
import { Check, Copy, Download, Github, Loader2 } from 'lucide-react'
import { api } from '../../lib/api.ts'
import { Card, CardContent } from '../../components/ui/Card.tsx'

type Triggers = {
  issueComment: boolean
  pullRequest: boolean
  pullRequestReviewComment: boolean
}

const STEPS = [
  '在下方勾选触发条件，预览生成的工作流 YAML',
  '复制或下载为 `.github/workflows/opencode.yml` 并提交到目标仓库',
  '在仓库 Settings → Secrets 中配置 `OPENCODE_API_KEY`（或按 OpenCode 文档要求的密钥）',
  '确认 Actions 权限允许读写 Issues / Pull Requests',
  '在 Issue/PR 评论中使用 `/oc`、`/opencode` 或 `/review` 触发',
]

export function GithubAutomationPage() {
  const [triggers, setTriggers] = useState<Triggers>({
    issueComment: true,
    pullRequest: false,
    pullRequestReviewComment: false,
  })
  const [yaml, setYaml] = useState('')
  const [filename, setFilename] = useState('opencode.yml')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const load = useCallback(async (next: Triggers) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/code-factory/github-workflow', {
        params: {
          issueComment: next.issueComment ? '1' : '0',
          pullRequest: next.pullRequest ? '1' : '0',
          pullRequestReviewComment: next.pullRequestReviewComment ? '1' : '0',
        },
      })
      setYaml(res.data?.yaml || '')
      setFilename(res.data?.filename || 'opencode.yml')
    } catch (err: any) {
      setError(err?.response?.data?.error || '生成工作流失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(triggers)
  }, [triggers, load])

  const toggle = (key: keyof Triggers) => {
    setTriggers((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const copyYaml = async () => {
    try {
      await navigator.clipboard.writeText(yaml)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('复制失败，请手动选中文本复制')
    }
  }

  const downloadYaml = () => {
    const blob = new Blob([yaml], { type: 'text/yaml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">GitHub 自动化</h2>
        <p className="text-sm text-slate-500">
          生成 OpenCode GitHub Action 工作流，支持 PR / Issue 评论触发的自动化审查。安装需你提交到仓库，本平台不代跑
          CLI。
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
            <Github className="h-4 w-4" />
            安装步骤
          </div>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="text-sm font-medium text-slate-800">触发条件</div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={triggers.issueComment}
                onChange={() => toggle('issueComment')}
                className="rounded border-slate-300"
              />
              Issue / PR 评论
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={triggers.pullRequest}
                onChange={() => toggle('pullRequest')}
                className="rounded border-slate-300"
              />
              Pull Request 打开/更新
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={triggers.pullRequestReviewComment}
                onChange={() => toggle('pullRequestReviewComment')}
                className="rounded border-slate-300"
              />
              PR Review 评论
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyYaml}
              disabled={!yaml || loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied ? '已复制' : '复制 YAML'}
            </button>
            <button
              type="button"
              onClick={downloadYaml}
              disabled={!yaml || loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              下载 {filename}
            </button>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </div>

          <pre className="max-h-[28rem] overflow-auto rounded-lg border border-slate-100 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
            {yaml || (loading ? '生成中…' : '暂无内容')}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
