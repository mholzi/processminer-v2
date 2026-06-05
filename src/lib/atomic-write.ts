// Atomic file write. The process JSON is the single source of truth and is
// rewritten in full on every mutation. A plain writeFileSync truncates the
// target and streams the new bytes in — so a concurrent reader (the UI
// re-reading mid-turn, a parallel tool call) can observe a half-written or
// empty file, and a crash mid-write leaves the document corrupt. This was the
// dogfood "cx-benchmarks 3 → 6 → 3" torn-read symptom.
//
// Writing to a sibling temp file and renaming over the target closes both
// windows: rename(2) is atomic on POSIX, so a reader sees either the old
// document or the new one, never an intermediate state.

import { writeFileSync, renameSync, unlinkSync } from "node:fs";

/**
 * Drop-in replacement for `writeFileSync(file, data, encoding)` that writes
 * atomically. Same arguments, same throw-on-error behaviour.
 */
export function atomicWriteFileSync(
  file: string,
  data: string,
  encoding: BufferEncoding = "utf8",
): void {
  // The temp name is colocated with the target so the rename stays on the same
  // filesystem (cross-device rename is not atomic). The pid keeps concurrent
  // writers in the same process tree from colliding on the temp path.
  const tmp = `${file}.${process.pid}.tmp`;
  try {
    writeFileSync(tmp, data, encoding);
    renameSync(tmp, file);
  } catch (err) {
    try {
      unlinkSync(tmp);
    } catch {
      /* temp file may not exist — nothing to clean up */
    }
    throw err;
  }
}
