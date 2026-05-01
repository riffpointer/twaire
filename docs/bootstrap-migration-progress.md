# Twaire Frontend Bootstrap Migration Progress

This document tracks the progress of migrating the Twaire frontend from Material UI (MUI) to Bootstrap 5.

## Phase 1: Foundation (Completed)
- [x] `bootstrap` and `bootstrap-icons` are correctly imported in `main.jsx`.
- [x] Basic theme variables and dark mode are set up.

## Phase 2: Global Layout (Completed)
- [x] `AppBarHeader.jsx`: Replaced MUI `AppBar`, `Toolbar`, `Autocomplete`, etc. with Bootstrap `navbar` and custom dropdowns.
- [x] `AppDrawer.jsx`: Replaced MUI `Drawer` with Bootstrap `offcanvas`.
- [x] `Footer.jsx`: Replaced MUI `Box`, `Divider`, and `Typography` with standard HTML and Bootstrap utilities.

## Phase 3: Core Components (Completed)
- [x] `Loading.jsx`: Replaced MUI `CircularProgress` with Bootstrap `spinner`.
- [x] `UserAvatar.jsx`: Replaced MUI `Avatar` with a standard `img`/`div` component.
- [x] `VerifiedUserBadge.jsx`: Replaced MUI `CheckCircleIcon` and `Tooltip` with a Bootstrap icon.
- [x] `Containers.jsx`: Replaced MUI `Box` with standard `div` and Bootstrap spacing classes.
- [x] `VideoCard.jsx`: Replaced MUI `Card`, `Skeleton`, `Menu`, `Dialog`, etc., with Bootstrap equivalents and custom components.
- [x] `VideoGrid.jsx`: Replaced MUI `Grid` with Bootstrap's `row` and `col` system.
- [x] `SubscribeButton.jsx`: Replaced MUI `Button` and `CircularProgress` with Bootstrap equivalents.
- [x] `ChannelBar.jsx`: Replaced MUI `Card` and layout components with Bootstrap `card`.
- [x] `PublicVideosList.jsx`: Replaced MUI layout and form components with Bootstrap equivalents.
- [x] `UserDropdown.jsx`: Replaced MUI `Menu` and `Dialog` with Bootstrap `dropdown` and `modal`.
- [x] `AccountSwitcherDialog.jsx`: Replaced MUI `Dialog` with Bootstrap `modal`.
- [x] `SaveToPlaylistDialog.jsx`: Replaced MUI `Dialog` with Bootstrap `modal`.
- [x] `PromptLoginDialog.jsx`: Replaced MUI `Dialog` with Bootstrap `modal`.
- [x] `AppSnackbar.jsx`: Replaced MUI `Snackbar` with Bootstrap `toast`.
- [x] `QueuePanel.jsx`: Replaced MUI `Paper`, `Collapse`, etc., with Bootstrap `card` and custom transitions.
- [x] `VideoActionBar.jsx`: Replaced MUI `ButtonGroup`, `Button`, and `Dialog` with Bootstrap equivalents.

## Phase 4: Page-Level Migration (In Progress)
- [x] `App.jsx`: Removed `ThemeProvider`, `CssBaseline`, and other MUI globals. Replaced `LinearProgress` with a Bootstrap `progress` bar.
- [x] `Home.jsx`: Ported to use Bootstrap grid and custom components.
- [x] `Watch.jsx`: Ported to use Bootstrap grid, cards, and custom components.
- [x] `About.jsx`
- [x] `Category.jsx`
- [ ] `Dashboard.jsx`
- [x] `Features.jsx`
- [x] `Login.jsx`
- [x] `MyAccount.jsx`
- [x] `NotFound.jsx`
- [ ] `Playlist.jsx`
- [ ] `ProfileSettings.jsx`
- [x] `Search.jsx`
- [x] `Signup.jsx`
- [x] `Subscriptions.jsx`
- [x] `Terms.jsx`
- [ ] `Trending.jsx`
- [ ] `User.jsx`

## Phase 5: Cleanup (Pending)
- [ ] Remove all `@mui/*` and `@emotion/*` dependencies from `package.json`.
- [ ] Run `npm install` to update `pnpm-lock.yaml`.
- [ ] Verify build size reduction and performance improvements.
- [ ] Final testing across all pages and screen sizes.
