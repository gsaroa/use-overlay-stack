# use-overlay-stack

**One Sheet. One Dialog. One AlertDialog.** Open any of them from anywhere in your React app — no prop-drilling `open` state through five components, no two features both rendering a `<Dialog>` and fighting over z-index.

```tsx
const { setDialog } = useOverlayStack()

<Button onClick={() => setDialog(<EditAccountForm accountId={id} />)}>
  Edit
</Button>
```

That's it. No local `useState`, no `<Dialog open={open}>` wrapper in this component, no worrying whether some parent already has one mounted.

## The problem

In most React codebases, every feature that needs a modal ends up doing this:

```tsx
function AccountRow({ account }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setEditOpen(true)}>Edit</Button>
      <Button onClick={() => setDeleteOpen(true)}>Delete</Button>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <EditAccountForm accountId={account.id} onDone={() => setEditOpen(false)} />
      </Dialog>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        ...
      </AlertDialog>
    </>
  )
}
```

Multiply that by every row, every table, every feature in the app, and you get: dozens of near-identical `open`/`onOpenChange` pairs, dialogs nested three components deep from where the trigger button lives, and two different features occasionally mounting a `<Dialog>` each — so you get two overlays stacked on top of each other with mismatched backdrops.

`use-overlay-stack` mounts **exactly one** Sheet, one Dialog, and one AlertDialog for your whole app (via a provider near the root), and gives you an imperative API to fill and open them from anywhere:

```tsx
function AccountRow({ account }) {
  const { setDialog, setAlertDialog } = useOverlayStack()

  return (
    <>
      <Button onClick={() => setDialog(<EditAccountForm accountId={account.id} />)}>
        Edit
      </Button>
      <Button
        onClick={() =>
          setAlertDialog({
            title: 'Delete this account?',
            variant: 'destructive',
            onConfirm: () => deleteAccount(account.id),
          })
        }
      >
        Delete
      </Button>
    </>
  )
}
```

No local state, no JSX for the overlay itself sitting next to the trigger, and it's structurally impossible for two features to both mount a dialog at once — there's only one.

## Why three fixed slots, not an arbitrary stack

It's tempting to build a fully generic `push()`/`pop()` overlay stack that can nest any number of any kind of overlay. In practice almost every app needs exactly this: **one sheet, one dialog, one confirm/alert dialog**, and occasionally two of those open at once (e.g. a confirm alert on top of a dialog). Three independent slots give you that combination for free, with an API small enough to hold in your head — and no risk of an accidental infinite stack of nested modals. If you outgrow this, you've outgrown this library; that's fine.

## Install

```bash
npm install use-overlay-stack
```

React 18+ only peer dependency. No UI library dependency — you bring your own Sheet, Dialog, and AlertDialog components (shadcn/ui, Radix primitives, Headless UI, Chakra, your own).

## Setup

Wrap your app once, near the root, passing in **your** overlay components:

```tsx
// app/providers.tsx
import { OverlayStackProvider } from 'use-overlay-stack'
import { Sheet } from '@/components/ui/sheet'
import { Dialog } from '@/components/ui/dialog'
import { AlertDialog } from '@/components/ui/alert-dialog'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OverlayStackProvider sheet={Sheet} dialog={Dialog} alertDialog={AlertDialog}>
      {children}
    </OverlayStackProvider>
  )
}
```

Your components need to accept `open: boolean` and `onOpenChange: (open: boolean) => void` — which shadcn/ui's `Sheet` and `Dialog` already do. The `alertDialog` component additionally receives the fields from `AlertDialogOptions` (`title`, `description`, `confirmText`, `cancelText`, `variant`, `onConfirm`, `onCancel`) as props, so you write one small adapter component around your alert dialog primitive that wires those into its buttons. See [`examples/shadcn-adapter.tsx`](./examples/shadcn-adapter.tsx) for a complete one.

## Usage

```tsx
import { useOverlayStack } from 'use-overlay-stack'

function DeleteButton({ accountId }: { accountId: string }) {
  const { setAlertDialog } = useOverlayStack()

  return (
    <Button
      onClick={() =>
        setAlertDialog({
          title: 'Delete this account?',
          description: 'This cannot be undone.',
          variant: 'destructive',
          confirmText: 'Delete',
          onConfirm: async () => {
            await deleteAccount(accountId)
          },
        })
      }
    >
      Delete
    </Button>
  )
}
```

Close any overlay imperatively by passing `null`:

```tsx
setSheet(null) // closes the sheet
setDialog(null) // closes the dialog
setAlertDialog(null) // closes the alert dialog
closeAll() // closes all three
```

Content stays mounted for one extra render after you close it, so your Sheet/Dialog component's own exit animation still has something to animate out — it isn't yanked from the DOM the instant `open` flips to `false`.

## API

### `<OverlayStackProvider sheet dialog alertDialog>`

| Prop | Type | Description |
|---|---|---|
| `sheet` | `ComponentType<{ open, onOpenChange, children? }>` | Your Sheet component. |
| `dialog` | `ComponentType<{ open, onOpenChange, children? }>` | Your Dialog component. |
| `alertDialog` | `ComponentType<{ open, onOpenChange } & AlertDialogOptions>` | Your AlertDialog component/adapter. |

### `useOverlayStack()`

| Method | Signature | Description |
|---|---|---|
| `setSheet` | `(content: ReactNode \| null) => void` | Render `content` in the sheet and open it, or close it with `null`. |
| `setDialog` | `(content: ReactNode \| null) => void` | Same, for the dialog. |
| `setAlertDialog` | `(options: AlertDialogOptions \| null) => void` | Configure and open the alert dialog, or close it with `null`. |
| `closeAll` | `() => void` | Close all three at once. |

### `AlertDialogOptions`

```ts
interface AlertDialogOptions {
  title: ReactNode
  description?: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}
```

## FAQ

**Does this depend on shadcn/ui or Radix?**
No. The provider takes your components as props and only assumes they accept `open`/`onOpenChange`. It works with any overlay primitive that follows that (very common) contract.

**Can I open two sheets at once?**
No — that's the point. One sheet slot means one sheet, ever. If a second feature calls `setSheet(...)` while one is open, it replaces the first. This is almost always what you want; if it isn't, this library isn't the right fit for that screen.

**What about Next.js Server Components?**
`OverlayStackProvider` and `useOverlayStack` are client-side (the provider file is marked `'use client'`). Mount the provider in a client component near your root layout, same as any other context provider.

## License

MIT © [Gurdeep Saroa](https://github.com/gsaroa)
