---
name: expo-router-architect
description: Expert in Expo Router and file-based navigation for the WatchList app. Use for adding new screens, modifying layouts, or handling complex navigation patterns in the React Native (Expo SDK 54) frontend.
---

# Expo Router Architect

This skill manages the navigation structure of the Expo frontend, ensuring smooth transitions and clean URL patterns.

## App Structure (frontend/app/)
- **(tabs)/_layout.tsx**: Defines the main bottom tab navigation (Home, Search, Watchlist, Settings).
- **movie/[id].tsx**: Dynamic route for movie detail pages.
- **_layout.tsx**: Root layout containing the `Stack` navigator and context providers (React Query, Theming).

## Workflow: Adding a New Screen

1.  **Identify Route**: Decide if the new screen belongs under the tabs or is a standalone dynamic route.
2.  **Create File**: Add a new `.tsx` file in the appropriate directory.
3.  **Update Layouts**: If it's a new tab, add a `Tabs.Screen` to `(tabs)/_layout.tsx`. If it's a standalone stack screen, add a `Stack.Screen` to the root `_layout.tsx`.
4.  **Navigation Logic**: Use `useRouter()` or `Link` from `expo-router` to navigate to the new screen.
5.  **Passing Params**: Use `useLocalSearchParams()` to retrieve dynamic parameters (e.g., `id` for movie details).

## Tips for Expo Router
- **Typed Routes**: Expo Router generates types for your routes; use them to ensure type-safe navigation.
- **Modals**: For screens that should appear as modals, use the `presentation: 'modal'` option in the layout's `Stack.Screen` or create a `modal.tsx` file.
- **Initial Route Name**: Ensure `initialRouteName` is correctly set in layouts to prevent user confusion.
- **Deep Linking**: Remember that Expo Router automatically handles deep links; ensure your route names are descriptive and SEO-friendly if the web is a target.
