import { useState, useCallback, useEffect } from 'react';
import type { Editor } from '@tiptap/core';
import { aiRequest, saveAiConfig, PROMPT_TEMPLATES } from '~/lib/ai-client';

interface AiAssistantProps {
  editor: Editor;
  onClose: () => void;
}

const OPERATIONS = Object.keys(PROMPT_TEMPLATES);

export default function AiAssistant({ editor, onClose }: AiAssistantProps) {
  const [operation, setOperation] = useState('续写');
  const [customPrompt, setCustomPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Initialize from URL params if available
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ep = params.get('ai_endpoint');
      const key = params.get('ai_key');
      const model = params.get('ai_model');
      if (ep) {
        setApiEndpoint(ep);
        setApiKey(key || '');
        saveAiConfig(ep, key || '', model || 'gpt-3.5-turbo');
      }
    } catch {
      // ignore
    }
  }, []);

  const selectedText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ');

  const handleRequest = useCallback(async () => {
    setLoading(true);
    setError('');
    const context =
      customPrompt ||
      selectedText ||
      editor.state.doc.textBetween(0, Math.min(editor.state.doc.content.size, 2000), ' ');
    if (!context.trim()) {
      setError('请先选中文本或输入自定义 prompt');
      setLoading(false);
      return;
    }
    const res = await aiRequest({ prompt: customPrompt, context, operation });
    if (res.error) {
      setError(res.error);
    } else {
      setResult(res.text);
    }
    setLoading(false);
  }, [customPrompt, selectedText, operation, editor]);

  const handleInsert = () => {
    if (result) {
      editor.chain().focus().insertContent(result).run();
      setResult('');
    }
  };

  const handleReplace = () => {
    if (result) {
      editor.chain().focus().deleteSelection().insertContent(result).run();
      setResult('');
    }
  };

  const handleSaveSettings = () => {
    saveAiConfig(apiEndpoint, apiKey, 'gpt-3.5-turbo');
    setShowSettings(false);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-base-100 border-l border-base-300 shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
        <h3 className="font-semibold text-sm">AI 写作助手</h3>
        <div className="flex gap-1">
          <button type="button" className="btn btn-ghost btn-xs" onClick={() => setShowSettings(!showSettings)}>
            设置
          </button>
          <button type="button" className="btn btn-ghost btn-xs" onClick={onClose}>
            ×
          </button>
        </div>
      </div>

      {showSettings ? (
        <div className="p-4 flex flex-col gap-3 flex-1">
          <label className="text-xs font-medium">API 地址</label>
          <input
            type="text"
            className="input input-bordered input-sm"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
            placeholder="https://api.openai.com"
          />
          <label className="text-xs font-medium">API Key</label>
          <input
            type="password"
            className="input input-bordered input-sm"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
          />
          <p className="text-xs text-base-content/50">
            兼容 OpenAI / Ollama / LM Studio 等 API 格式
            <br />
            Key 仅保存在当前会话中，关闭浏览器后自动清除。
            <br />
            生产环境建议通过服务端代理调用。
          </p>
          <button type="button" className="btn btn-primary btn-sm w-full" onClick={handleSaveSettings}>
            保存设置
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
          <label className="text-xs font-medium">操作</label>
          <select
            className="select select-bordered select-sm w-full"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
          >
            {OPERATIONS.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>

          {selectedText && (
            <div className="bg-base-200 rounded p-2 text-xs max-h-20 overflow-y-auto text-base-content/70">
              <p className="font-medium mb-1">已选中文本：</p>
              {selectedText.slice(0, 300)}
              {selectedText.length > 300 ? '…' : ''}
            </div>
          )}

          <label className="text-xs font-medium">自定义 prompt（可选）</label>
          <textarea
            className="textarea textarea-bordered text-sm"
            rows={3}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="留空则使用默认 prompt"
          />

          <button type="button" className="btn btn-primary btn-sm w-full" disabled={loading} onClick={handleRequest}>
            {loading ? <span className="loading loading-spinner loading-xs mr-1" /> : null}
            {loading ? '请求中…' : '发送请求'}
          </button>

          {error && <div className="text-xs text-error bg-error/10 rounded p-2">{error}</div>}

          {result && (
            <div className="bg-base-200 rounded-lg p-3">
              <div className="text-sm whitespace-pre-wrap mb-3 max-h-64 overflow-y-auto">{result}</div>
              <div className="flex gap-1">
                <button type="button" className="btn btn-primary btn-xs flex-1" onClick={handleInsert}>
                  插入
                </button>
                <button type="button" className="btn btn-ghost btn-xs flex-1" onClick={handleReplace}>
                  替换选中
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
