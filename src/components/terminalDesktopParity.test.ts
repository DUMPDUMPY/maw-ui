import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const modal = readFileSync(new URL("./TerminalModal.tsx", import.meta.url), "utf8");
const terminal = readFileSync(new URL("./TerminalView.tsx", import.meta.url), "utf8");

describe("desktop terminal deep-link parity", () => {
  test("keeps desktop deep-links in TerminalView instead of opening TerminalModal", () => {
    expect(app).toContain("route === \"terminal\" && !isNarrow");
    expect(app).toContain("setHashTerminalTarget(match.target)");
    expect(app).toContain("initialTarget={hashTerminalTarget}");
    expect(terminal).toContain("initialTarget?: string | null");
    expect(terminal).toContain("selectWindow(initialTarget)");
  });

  test("closes TerminalModal on capture-phase Escape", () => {
    expect(modal).toContain('window.addEventListener("keydown", handler, true)');
    expect(modal).toContain('window.removeEventListener("keydown", handler, true)');
  });

  test("lets Escape through to xterm when the terminal has focus", () => {
    expect(modal).toContain('.closest(".xterm")');
  });

  test("renders on-screen quick keys incl left/right arrows that inject into the PTY", () => {
    expect(modal).toContain("MODAL_KEYS");
    expect(modal).toContain("xtermRef.current?.inject(cmd.text)");
    expect(modal).toContain('"←"');
    expect(modal).toContain('"→"');
  });

  test("mission pinned card has full arrow D-pad sending VT bytes to tmux", () => {
    const card = readFileSync(new URL("./HoverPreviewCard.tsx", import.meta.url), "utf8");
    expect(card).toContain('title="Left → tmux"');
    expect(card).toContain('title="Right → tmux"');
    expect(card).toContain('text: "\\x1b[D"');
    expect(card).toContain('text: "\\x1b[C"');
  });
});
