import { useState } from 'react'
import { Card, CardContent } from '../../components/ui/Card.tsx'
import { Send } from 'lucide-react'

export function AgentChatPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'agent'; content: string }[]>([])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    setMessages((prev) => [...prev, { role: 'user', content: input }])
    setInput('')
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'agent', content: '这是来自 BuildingAI 智能体的模拟回复。' }])
    }, 500)
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-900">智能体对话</h2>
      <Card className="flex-1 overflow-auto">
        <CardContent className="space-y-4">
          {messages.length === 0 && <p className="text-sm text-slate-500">选择智能体开始对话...</p>}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-2xl rounded-lg px-4 py-2 text-sm ${
                  m.role === 'user' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-900'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-violet-500 focus:outline-none"
          placeholder="输入问题..."
        />
        <button
          onClick={handleSend}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Send className="h-4 w-4" />
          发送
        </button>
      </div>
    </div>
  )
}
