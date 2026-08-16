// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AuthStatus from "../components/shared/AuthStatus.vue";
import AuthSegmentedControl from "../components/shared/AuthSegmentedControl.vue";

describe("AuthStatus", () => {
  it("渲染错误消息并带 aria-live", () => {
    const w = mount(AuthStatus, {
      props: { type: "error", message: "密码错误" },
    });
    expect(w.text()).toContain("密码错误");
    expect(w.find("[aria-live]").exists()).toBe(true);
  });
});
describe("AuthSegmentedControl", () => {
  it("切换时发出 update:modelValue", async () => {
    const w = mount(AuthSegmentedControl, {
      props: {
        options: [
          { key: "a", label: "A" },
          { key: "b", label: "B" },
        ],
        modelValue: "a",
      },
    });
    const b = w.findAll("button")[1];
    await b.trigger("click");
    const emitted = w.emitted("update:modelValue");
    expect(emitted?.[0]).toEqual(["b"]);
  });
});
