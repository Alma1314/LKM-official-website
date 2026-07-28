import { useState, useCallback, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/core';
import { setAiConfig, requestAiCompletion, validateAiEndpoint, PROMPT_TEMPLATES } from '../../stores/ai-client';

interface AiAssistantProps {
  editor: Editor;
  onClose: () => void;
}

const OPERATIONS = Object.keys(PROMPT_TEMPLATES);

const THIRD_PARTY_NOTICE = '注意：您的编辑器内容将被发送至第三方 AI 服务商处理。请勿在内容中包含个人敏感信息。';

export default function AiAssistant({ editor, onClose }: AiAssistantProps) {
  const [operation, setOperation] = useState('续写');
  const [customPrompt, setCustomPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Abort controller ref for in-flight requests – aborted on unmount
  const abortRef = useRef<AbortController | null>(null);

  // Cleanup: abort any in-flight request when the panel unmounts
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const selectedText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ');

  const handleRequest = useCallback(async () => {
    setLoading(true);
    setError('');

    // Validate endpoint before calling the store (which will also validate)
    if (apiEndpoint) {
      const validation = validateAiEndpoint(apiEndpoint);
      if (!validation.ok) {
        setError(validation.error);
        setLoading(false);
        return;
      }
    }

    const context =
      customPrompt ||
      selectedText ||
      editor.state.doc.textBetween(0, Math.min(editor.state.doc.content.size, 2000), ' ');
    if (!context.trim()) {
      setError('请先选中文本或输入自定义 prompt');
      setLoading(false);
      return;
    }

    // Abort any previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const res = await requestAiCompletion({ prompt: customPrompt, context, operation }, { signal: controller.signal });

    if (!controller.signal.aborted) {
      if (res.ok) {
        setResult(res.value);
      } else {
        setError(res.error);
      }
    }

    abortRef.current = null;
    setLoading(false);
  }, [customPrompt, selectedText, operation, editor, apiEndpoint]);

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
    // Validate endpoint before storing
    const validation = validateAiEndpoint(apiEndpoint);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setAiConfig(apiEndpoint, apiKey, 'gpt-3.5-turbo');
    setShowSettings(false);
    setError('');
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 border-l border-surface-3 shadow-xl z-50 flex flex-col rte-panel">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-3">
        <h3 className="font-semibold text-sm">AI 写作助手</h3>
        <div className="flex gap-1">
          <button
            type="button"
            className="rte-btn rte-btn--ghost rte-btn--xs"
            onClick={() => setShowSettings(!showSettings)}
          >
            设置
          </button>
          <button type="button" className="rte-btn rte-btn--ghost rte-btn--xs" onClick={onClose}>
            ×
          </button>
        </div>
      </div>

      {showSettings ? (
        <div className="p-4 flex flex-col gap-3 flex-1">
          <label className="text-xs font-medium">API 地址</label>
          <input
            type="text"
            className="rte-input rte-input--sm"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
            placeholder="https://api.openai.com"
          />
          <label className="text-xs font-medium">API Key</label>
          <input
            type="password"
            className="rte-input rte-input--sm"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
          />
          <p className="text-xs text-deep-text/50">
            兼容 OpenAI / Ollama / LM Studio 等 API 格式
            <br />
            Key 仅保存在当前页面内存中，刷新或关闭页面后自动清除。
            <br />
            生产环境建议通过服务端代理调用。
          </p>
          <button type="button" className="rte-btn rte-btn--primary rte-btn--sm w-full" onClick={handleSaveSettings}>
            保存设置
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
          {/* Third-party data sharing notice */}
          <div className="text-xs text-warning bg-warning/5 rounded p-2 leading-relaxed">{THIRD_PARTY_NOTICE}</div>

          <label className="text-xs font-medium">操作</label>
          <select
            className="rte-select rte-select--sm w-full"
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
            <div className="bg-page-bg rounded p-2 text-xs max-h-20 overflow-y-auto text-deep-text/70">
              <p className="font-medium mb-1">已选中文本：</p>
              {selectedText.slice(0, 300)}
              {selectedText.length > 300 ? '…' : ''}
            </div>
          )}

          <label className="text-xs font-medium">自定义 prompt（可选）</label>
          <textarea
            className="rte-textarea text-sm"
            rows={3}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="留空则使用默认 prompt"
          />

          <button
            type="button"
            className="rte-btn rte-btn--primary rte-btn--sm w-full"
            disabled={loading}
            onClick={handleRequest}
          >
            {loading ? <div className="rte-spinner mr-1" /> : null}
            {loading ? '请求中…' : '发送请求'}
          </button>

          {error && <div className="text-xs text-error bg-error/10 rounded p-2">{error}</div>}

          {result && (
            <div className="bg-page-bg rounded-lg p-3">
              <div className="text-sm whitespace-pre-wrap mb-3 max-h-64 overflow-y-auto">{result}</div>
              <div className="flex gap-1">
                <button type="button" className="rte-btn rte-btn--primary rte-btn--xs flex-1" onClick={handleInsert}>
                  插入
                </button>
                <button type="button" className="rte-btn rte-btn--ghost rte-btn--xs flex-1" onClick={handleReplace}>
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
