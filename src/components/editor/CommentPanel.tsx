import { useState, useEffect, useCallback, memo } from 'react';
import {
  getThreads,
  addReply,
  resolveThread,
  reopenThread,
  deleteThread,
  type CommentThread,
} from '~/lib/comment-store';

interface CommentPanelProps {
  documentId: string;
  onClose: () => void;
  onHighlightClick: (range: { from: number; to: number }) => void;
}

const CommentPanel = memo(function CommentPanel({ documentId, onClose, onHighlightClick }: CommentPanelProps) {
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});

  const refresh = useCallback(() => {
    setThreads(getThreads(documentId));
  }, [documentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAddReply = (threadId: string) => {
    const text = replyInput[threadId]?.trim();
    if (text) {
      addReply(documentId, threadId, text);
      setReplyInput((prev) => ({ ...prev, [threadId]: '' }));
      refresh();
    }
  };

  const handleResolve = (threadId: string) => {
    resolveThread(documentId, threadId);
    refresh();
  };

  const handleReopen = (threadId: string) => {
    reopenThread(documentId, threadId);
    refresh();
  };

  const handleDelete = (threadId: string) => {
    if (window.confirm('确定删除此评论？')) {
      deleteThread(documentId, threadId);
      refresh();
    }
  };

  return (
    <div className="w-80 border-l border-base-300 bg-base-200/50 flex flex-col">
      <div className="flex items-center justify-between px-3 py-3 border-b border-base-300">
        <h3 className="text-sm font-semibold">评论</h3>
        <button type="button" className="btn btn-ghost btn-xs" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <p className="text-xs text-base-content/50 px-3 py-4">暂无评论。选中文字后点击评论按钮添加。</p>
        ) : (
          threads.map((thread) => (
            <div key={thread.id} className={`border-b border-base-300/50 ${thread.resolved ? 'opacity-60' : ''}`}>
              {/* Thread header */}
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-xs hover:bg-base-200"
                onClick={() => onHighlightClick(thread.range)}
              >
                <span className="font-mono text-base-content/50 italic">
                  "{thread.text.slice(0, 60)}
                  {thread.text.length > 60 ? '…' : ''}"
                </span>
              </button>

              {/* Replies */}
              <div className="px-3 pb-2 space-y-1.5">
                {thread.comments.map((c) => (
                  <div key={c.id} className="text-xs bg-base-100 rounded p-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="font-medium">{c.author}</span>
                      <span className="text-base-content/40">{new Date(c.createdAt).toLocaleString('zh-CN')}</span>
                    </div>
                    <div className="text-base-content/80 whitespace-pre-wrap">{c.text}</div>
                  </div>
                ))}
              </div>

              {/* Reply input */}
              <div className="px-3 pb-2">
                <div className="flex gap-1">
                  <input
                    type="text"
                    className="input input-bordered input-xs flex-1"
                    placeholder="输入回复…"
                    value={replyInput[thread.id] ?? ''}
                    onChange={(e) => setReplyInput((prev) => ({ ...prev, [thread.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddReply(thread.id);
                    }}
                  />
                  <button type="button" className="btn btn-xs btn-ghost" onClick={() => handleAddReply(thread.id)}>
                    发送
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 px-3 pb-2">
                {thread.resolved ? (
                  <button type="button" className="btn btn-xs btn-ghost" onClick={() => handleReopen(thread.id)}>
                    重新打开
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost text-success"
                    onClick={() => handleResolve(thread.id)}
                  >
                    解决
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-xs btn-ghost text-error"
                  onClick={() => handleDelete(thread.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default CommentPanel;
