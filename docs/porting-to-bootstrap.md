# Prompt: Porting Twaire Frontend from Material UI to Bootstrap

## Context
You are an expert Frontend Engineer tasked with migrating the **Twaire** project's frontend from **Material UI (MUI)** to **Bootstrap 5**. The goal is to improve performance by reducing the heavy runtime overhead of MUI and Emotion, while maintaining a functional and aesthetic experience that is "similar" to the current design.

## Objectives
1.  **Remove MUI Dependency**: Replace all MUI components (`@mui/material`, `@mui/icons-material`, `@mui/lab`) with Bootstrap equivalents or standard HTML/CSS.
2.  **Maintain Functionality**: Ensure all interactive elements (drawers, dialogs, dropdowns, autocompletes) remain fully functional.
3.  **Boost Performance**: Prioritize lightweight implementations. Use Bootstrap's utility classes and native CSS features.
4.  **Aesthetic Consistency**: The UI should feel like Twaire. It doesn't need to be a 1:1 pixel-perfect port of MUI, but it should be clean, responsive, and familiar.

## Mapping Guide
When porting components, follow these general mappings:

-   **Layout & Surface**:
    -   `AppBar` & `Toolbar` -> Bootstrap `.navbar` and `.container-fluid`.
    -   `Box`, `Stack`, `Grid` -> Bootstrap Flexbox (`d-flex`), Grid system (`row`, `col`), and spacing utilities (`m-*`, `p-*`).
    -   `Paper`, `Card` -> Bootstrap `.card` or custom `.twaire-surface` class.
    -   `Container` -> Bootstrap `.container` or `.container-fluid`.

-   **Inputs & Actions**:
    -   `Button` -> Bootstrap `.btn`. Map `variant="contained"` to `.btn-primary` (or custom brand color) and `variant="outlined"` to `.btn-outline-*`.
    -   `IconButton` -> `.btn .btn-link` or `.btn .rounded-circle` with icon inside.
    -   `TextField`, `Input` -> Bootstrap `.form-control` and `.form-group`.
    -   `Autocomplete` -> Custom lightweight implementation using a standard `<input>` and a Bootstrap dropdown/list-group for suggestions.

-   **Navigation & Feedback**:
    -   `Drawer` -> Bootstrap Offcanvas component.
    -   `Dialog`, `Modal` -> Bootstrap Modal component.
    -   `Menu`, `Popover` -> Bootstrap Dropdown component.
    -   `Tabs` -> Bootstrap Nav Tabs.
    -   `Typography` -> Standard HTML tags (`h1`-`h6`, `p`, `span`) with Bootstrap typography classes (`h1`, `text-muted`, `fw-bold`).
    -   `CircularProgress` -> Bootstrap Spinners.

-   **Icons**:
    -   Replace `@mui/icons-material` with **Bootstrap Icons** or **FontAwesome** (already used in some parts of the project).

## Strategy
1.  **Phase 1: Foundation**: Ensure `bootstrap` and `bootstrap-icons` are correctly imported in `main.jsx`.
2.  **Phase 2: Global Layout**: Port `AppBarHeader`, `AppDrawer`, and `Footer` first to establish the site shell.
3.  **Phase 3: Core Components**: Port reusable components like `VideoCard`, `UserAvatar`, and `Loading`.
4.  **Phase 4: Page-Level Migration**: Iterate through pages (Home, Watch, Profile) and replace inline MUI styles with Bootstrap utility classes.
5.  **Phase 5: Cleanup**: Once all components are ported, remove `@mui/*` and `@emotion/*` from `package.json`.

## Implementation Rules
-   **Prefer CSS Variables**: Use Bootstrap's CSS variables for theme consistency.
-   **Utility First**: Use Bootstrap's utility classes (`d-flex`, `justify-content-between`, `align-items-center`, `mt-3`, etc.) to replicate MUI's `sx` prop functionality.
-   **Avoid Over-Engineering**: If a component can be built with pure HTML/CSS and 2 lines of Bootstrap, do that instead of looking for a complex library.
-   **Responsiveness**: Ensure the port maintains or improves the mobile experience.

## Verification
-   Run `npm run build` to verify bundle size reduction.
-   Manually test all interactive UI elements (modals, dropdowns, navigation).
-   Check layout across different screen sizes (Mobile, Tablet, Desktop).
