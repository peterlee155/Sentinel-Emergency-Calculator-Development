export type TriggerMatchCallback = (matchedTrigger: string) => void;

export class ShortcutBuffer {
  private buffer: string = '';
  private readonly maxBufferSize: number = 32;
  private readonly timeoutMs: number = 10000; // 10 seconds of inactivity resets buffer
  private timeoutTimer: any = null;

  /**
   * Append a character to the rolling buffer
   */
  public pushChar(char: string): string {
    this.buffer += char;
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer = this.buffer.slice(-this.maxBufferSize);
    }
    this.resetTimer();
    return this.buffer;
  }

  public append(char: string): string {
    return this.pushChar(char);
  }

  public pushDigit(digit: string): string {
    return this.pushChar(digit);
  }

  public backspace(): void {
    if (this.buffer.length > 0) {
      this.buffer = this.buffer.slice(0, -1);
      this.resetTimer();
    }
  }

  /**
   * Get the current buffer content
   */
  public getBuffer(): string {
    return this.buffer;
  }

  /**
   * Clear the sequence buffer
   */
  public clear(): void {
    this.buffer = '';
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }

  /**
   * Check if any registered trigger matches the current buffer tail
   */
  public checkTriggers(triggers: string[]): string | null {
    for (const trigger of triggers) {
      if (trigger && this.buffer.endsWith(trigger)) {
        return trigger;
      }
    }
    return null;
  }

  private resetTimer(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
    }
    this.timeoutTimer = setTimeout(() => {
      this.clear();
    }, this.timeoutMs);
  }
}

export const shortcutBuffer = new ShortcutBuffer();
export default shortcutBuffer;
