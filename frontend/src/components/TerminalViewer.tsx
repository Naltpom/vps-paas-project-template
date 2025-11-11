/**
 * Terminal Viewer Component
 * Displays real-time logs from Claude CLI execution in terminal-style
 */

import React, { useEffect, useRef, useState } from 'react';
import { PROJECT_CONFIG } from '../config/project';

interface LogLine {
  type: string;
  log_type: 'stdout' | 'stderr' | 'system';
  log_line: string;
  line_number: number;
  created_at: string;
}

export const TerminalViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Only connect if execution ID is configured
    if (!PROJECT_CONFIG.executionId || !PROJECT_CONFIG.mcpApiUrl) {
      console.log('[TerminalViewer] No execution ID or MCP API URL configured');
      return;
    }

    // Construct SSE URL
    const logsStreamUrl = `${PROJECT_CONFIG.mcpApiUrl}/api/executions/${PROJECT_CONFIG.executionId}/logs/stream`;
    console.log('[TerminalViewer] Connecting to:', logsStreamUrl);

    // Create EventSource for SSE
    const eventSource = new EventSource(logsStreamUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[TerminalViewer] SSE connection opened');
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'log') {
          setLogs((prev) => [...prev, data]);
        } else if (data.type === 'complete') {
          console.log('[TerminalViewer] Execution complete:', data.status);
          setIsComplete(true);
          eventSource.close();
        } else if (data.type === 'error') {
          console.error('[TerminalViewer] Error from server:', data.message);
          setError(data.message);
          eventSource.close();
        }
      } catch (err) {
        console.error('[TerminalViewer] Failed to parse SSE data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[TerminalViewer] SSE error:', err);
      setIsConnected(false);
      setError('Connection lost. Retrying...');
    };

    // Cleanup on unmount
    return () => {
      console.log('[TerminalViewer] Closing SSE connection');
      eventSource.close();
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // If no execution ID, don't show terminal
  if (!PROJECT_CONFIG.executionId) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-gray-400 text-sm ml-4">
              Claude CLI - {PROJECT_CONFIG.name}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {isConnected && !isComplete && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-green-400">Live</span>
              </div>
            )}
            {isComplete && (
              <span className="text-xs text-gray-400">Completed</span>
            )}
            {error && (
              <span className="text-xs text-red-400">{error}</span>
            )}
          </div>
        </div>

        {/* Terminal Body */}
        <div
          ref={terminalRef}
          className="p-4 font-mono text-sm h-96 overflow-y-auto bg-gray-900 text-gray-100"
        >
          {logs.length === 0 && !isComplete && (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-pulse">▸</div>
              <span>Waiting for logs...</span>
            </div>
          )}

          {logs.map((log, index) => (
            <div
              key={`${log.line_number}-${index}`}
              className={`whitespace-pre-wrap break-words ${
                log.log_type === 'stderr'
                  ? 'text-red-400'
                  : log.log_type === 'system'
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            >
              {log.log_line}
            </div>
          ))}

          {isComplete && (
            <div className="mt-4 pt-4 border-t border-gray-700 text-green-400">
              ✓ Execution completed
            </div>
          )}
        </div>

        {/* Terminal Footer */}
        <div className="bg-gray-800 px-4 py-2 text-xs text-gray-500 border-t border-gray-700">
          {logs.length} lines · Execution ID: {PROJECT_CONFIG.executionId}
        </div>
      </div>
    </div>
  );
};
