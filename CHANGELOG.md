# use-overlay-stack

## 0.1.0

Initial release.

- `<OverlayStackProvider>` mounts a single Sheet, Dialog, and AlertDialog for the whole app, driven by your own components (no dependency on shadcn/ui or Radix — just an `open`/`onOpenChange` contract).
- `useOverlayStack()` exposes `setSheet`, `setDialog`, `setAlertDialog`, and `closeAll` to control them from anywhere, without prop-drilling `open` state or letting individual features mount their own overlay instances.
- Closed content stays mounted for one extra render so exit animations still play.

Future releases are tracked via [Changesets](https://github.com/changesets/changesets) — see `.changeset/README.md`.
