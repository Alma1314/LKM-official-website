import { reactive, onBeforeUnmount } from "vue";

interface VerificationCountdownState {
  countdown: number;
  running: boolean;
  start: () => void;
  stop: () => void;
}

/**
 * 验证码发送倒计时（reactive 状态，模板/测试直接取值即响应式）。
 * start() 重置为初始 seconds 并每秒递减；归零后 running=false。
 * onBeforeUnmount 自动清 interval，避免组件卸载后泄漏。
 */
export function useVerificationCountdown(
  seconds = 60,
): VerificationCountdownState {
  const state = reactive<VerificationCountdownState>({
    countdown: seconds,
    running: false,
    start,
    stop,
  });

  let timer: ReturnType<typeof setInterval> | null = null;

  function stop(): void {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    state.running = false;
  }

  function start(): void {
    stop();
    state.countdown = seconds;
    state.running = true;
    timer = setInterval(() => {
      if (state.countdown <= 1) {
        state.countdown = 0;
        stop();
      } else {
        state.countdown -= 1;
      }
    }, 1000);
  }

  onBeforeUnmount(stop);

  return state;
}
