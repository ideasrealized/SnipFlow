# SnipFlow - State of Development

This document outlines the current troubleshooting focus and the upcoming roadmap items for the SnipFlow project.

## Current Troubleshooting Focus

The primary feature currently undergoing troubleshooting is the **Edge Hover Overlay**.

1.  **Overlay Visibility & Stability:**
    *   **Current Symptom:** The overlay window appears correctly upon the first mouse hover at the screen edge. However, it subsequently fails to hide. Logs from `main.ts` suggest a loop where the overlay is repeatedly instructed to show. This is because the hide sequence does not fully complete; specifically, the `overlayState` variable in `main.ts` likely gets stuck in a state other than `'hidden'` (e.g., `'hiding'`, or rapidly cycling `visible` -> `hiding` -> `showing`), and the physical `BrowserWindow` for the overlay is not being hidden.
    *   **Suspected Root Cause:** The renderer process for the overlay (`overlay.ts`) is most likely not sending the `ipcRenderer.send('overlay:hidden-ack');` message back to the main process (`main.ts`). The main process logic has been refactored to rely solely on this acknowledgment signal to physically hide the overlay's `BrowserWindow` and to finalize its internal state to `'hidden'`. Without this acknowledgment, `main.ts` cannot complete the hide cycle.
    *   **Immediate Next Step (Troubleshooting):** The developer needs to verify that the `overlay.ts` code correctly and reliably sends the `ipcRenderer.send('overlay:hidden-ack');` message after it receives the `'overlay:hide'` command from `main.ts` and has finished all its internal hiding procedures (e.g., animations, DOM manipulations).

## Roadmap - Next Few Steps

Once the current overlay issue is resolved, development will proceed with the following:

1.  **Stabilize Overlay Feature:**
    *   Confirm resolution of the "show/no-hide" loop by thoroughly testing the `overlay:hidden-ack` mechanism.
    *   Conduct comprehensive testing of various overlay show/hide scenarios:
        *   Edge hover activation and deactivation.
        *   Hiding via overlay window blur.
        *   Hiding via manual triggers (e.g., an IPC call like `hide-overlay`, potentially mapped to an Escape key).
    *   Ensure that content within the overlay (e.g., pinned SnipChains, clipboard items) renders correctly, consistently, and updates as expected once the visibility and state management are stable.

2.  **SnipChain Manager UI Enhancements:**
    *   This is a significant feature that was previously under active development.
    *   **Review and Refine Existing UI Components:**
        *   Revisit and test `ChainManagerView.tsx`, `ChainListPanel.tsx`, and `HybridChainEditorView.tsx`.
        *   Verify and complete drag & drop reordering functionality for chain steps/nodes (using `react-beautiful-dnd`).
        *   Implement or refine the mini-map visualizer for complex chains (if this concept is retained).
        *   Enhance visual cues for SnipChain syntax (e.g., for `[?]` dynamic inputs, choice nodes) within the editor.
    *   **Further UI Development (aligning with original project vision):**
        *   Implement concepts of progressive complexity if applicable, allowing users to manage chains with varying levels of detail.
        *   Ensure robust and intuitive CRUD (Create, Read, Update, Delete) operations for SnipChains through the UI, with reliable interaction with the backend IPC handlers in `main.ts`.
        *   Test and ensure the persistence and correct display/editing of chain metadata such as `layoutData` (for visualizers), `description`, and `tags`.

3.  **Core SnipChain Functionality & Execution:**
    *   Investigate and resolve any persistent minor backend issues, such as the recurring log `db.getChainById(...) has malformed tags structure` for certain chains, to ensure data integrity and prevent downstream errors.
    *   Thoroughly test the `processTextWithChain` service in `main.ts`. This includes:
        *   Execution of chains with dynamic input placeholders (`[?]`).
        *   Interaction with choice providers and input providers during chain execution.
        *   Triggering chain execution from various points (e.g., overlay, main application UI, global hotkeys if planned).

4.  **General Application Stability & Polish:**
    *   Perform a codebase review to identify and address any remaining TypeScript errors, warnings, or type inconsistencies.
    *   Review and resolve any outstanding linter issues (e.g., `better-sqlite3` native bindings if build/test issues recur).
    *   Enhance error handling mechanisms and user feedback across all parts of the application (`main.ts`, the main React renderer, and `overlay.ts`).
    *   Improve logging for easier debugging and monitoring of application behavior.

This roadmap will be updated as development progresses and new priorities emerge. 