## 1. Menu path helper

- [x] 1.1 Add a pure function that, given menu tree + pathname, returns the deepest matching label chain (same match rules as Sidebar)
- [x] 1.2 Format the chain as `label1 / label2` (single label when only one level); return empty/null when no match
- [x] 1.3 Add unit tests for nested match, top-level leaf, and no-match cases

## 2. TopBar UI

- [x] 2.1 Wire TopBar to `useMenu()` + current location; render the menu path in place of the health status block
- [x] 2.2 Remove Activity icon, health status copy, `useHealth` usage, and unused `PAGE_TITLES` from TopBar
- [x] 2.3 Manually verify on a nested page (e.g. `/code-factory/sessions` shows `代码工厂 / 会话列表`) and that health text no longer appears
