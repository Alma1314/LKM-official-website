import { Component, useEffect, useState, lazy, Suspense } from 'react';
import type { PersistenceAdapter } from '../../engine/types';
import '../../styles/editor.css';

const DocumentEditor = lazy(() => import('./DocumentEditor'));

function getDocumentId(): string {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) return id;
  const hash = window.location.hash.slice(1);
  if (hash) return hash;
  return 'new';
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 6000];

interface Props {
  docId: string;
  adapter: PersistenceAdapter;
}

interface State {
  retries: number;
  error: Error | null;
  errorVersion: number;
}

class EditorErrorBoundary extends Component<Props, State> {
  state: State = { retries: 0, error: null, errorVersion: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  handleRetry = () => {
    const { retries } = this.state;
    if (retries >= MAX_RETRIES) return;
    this.setState({ error: null, retries: retries + 1, errorVersion: retries + 1 });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    const { docId, adapter } = this.props;
    const { error, retries, errorVersion } = this.state;

    if (error) {
      if (retries < MAX_RETRIES) {
        const delay = RETRY_DELAYS[retries];
        // 自动重试
        if (retries > 0) {
          setTimeout(() => this.handleRetry(), delay);
          return (
            <div className="rte-root">
              <div className="rte-loading">
                <div className="rte-spinner" />
                <span className="text-sm">
                  正在重试加载编辑器……({retries}/{MAX_RETRIES})
                </span>
                <pre className="rte-error">{error.message || String(error)}</pre>
              </div>
            </div>
          );
        }
        // 首次失败，显示首次自动重试中
        return (
          <div className="rte-root">
            <div className="rte-loading">
              <div className="rte-spinner" />
              <span className="text-sm">编辑器加载异常，正在重试……</span>
            </div>
          </div>
        );
      }

      // 3 次重试全部失败，显示降级提示
      return (
        <div className="rte-root">
          <div className="rte-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-error"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <h3>编辑器加载失败</h3>
            <p>已尝试 {MAX_RETRIES} 次加载，仍无法启动编辑器。可能的原因：</p>
            <ul className="text-xs list-disc list-inside text-left">
              <li>开发服务器预构建缓存过期</li>
              <li>网络连接问题</li>
              <li>浏览器缓存冲突</li>
            </ul>
            <div className="rte-error-actions">
              <button className="rte-btn rte-btn--sm" onClick={this.handleRefresh}>
                刷新页面
              </button>
              <button
                className="rte-btn rte-btn--primary rte-btn--sm"
                onClick={() => {
                  const v = this.state.errorVersion;
                  this.setState({ retries: 0, error: null, errorVersion: v + 1 });
                  this.handleRetry();
                }}
              >
                重新尝试
              </button>
            </div>
            <pre>{error.message || String(error)}</pre>
          </div>
        </div>
      );
    }

    // 使用 errorVersion 作为 Suspense key，仅重新触发 lazy 加载，不重建编辑器实例
    return (
      <Suspense
        key={errorVersion}
        fallback={
          <div className="rte-root">
            <div className="rte-loading">
              <div className="rte-spinner" />
              <span>正在加载编辑器……</span>
            </div>
          </div>
        }
      >
        <DocumentEditor documentId={docId} adapter={adapter} />
      </Suspense>
    );
  }
}

export interface EditorMountProps {
  adapter: PersistenceAdapter;
}

export default function EditorMount({ adapter }: EditorMountProps) {
  const [docId, setDocId] = useState<string | null>(null);

  useEffect(() => {
    setDocId(getDocumentId());
  }, []);

  if (!docId) {
    return (
      <div className="rte-root">
        <div className="rte-loading">
          <div className="rte-spinner" />
          <span>正在加载编辑器……</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rte-root">
      <EditorErrorBoundary docId={docId} adapter={adapter} />
    </div>
  );
}
