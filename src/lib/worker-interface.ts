export type WorkerEvent = Record<string, unknown> & {
  type?: string;
  session_id?: string | null;
  result?: string;
  is_error?: boolean;
  error?: string;
};

/**
 * Common interface representing an active assistant session worker backend.
 */
export interface IProcessWorker {
  /** Stable handle — known before LLM assigns a session id. */
  readonly id: string;
  /** The session id, stable for life. */
  sessionId: string | null;
  /** True while a turn is in flight — handles one turn at a time. */
  busy: boolean;
  /** Wall-clock of the last turn boundary — drives idle eviction. */
  lastUsed: number;
  /** False once the worker has exited/disposed. */
  alive: boolean;

  /**
   * Run one turn: send the user message, yield raw event stream chunks.
   * Throws if worker is dead, busy, or execution fails.
   */
  runTurn(message: string, skill?: string | null, mode?: number | null): AsyncGenerator<WorkerEvent>;

  /** Kill the worker. */
  dispose(): void;
}
