// Example adapter wiring shadcn/ui's AlertDialog primitives up to the
// `AlertDialogOptions` contract that `use-overlay-stack` passes to the
// `alertDialog` prop of `<OverlayStackProvider>`.
//
// shadcn/ui's own `Sheet` and `Dialog` already accept `open`/`onOpenChange`
// as-is, so they need no adapter — pass them to the provider directly.

import type { AlertDialogComponent } from 'use-overlay-stack'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export const AppAlertDialog: AlertDialogComponent = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Continue',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description ? (
          <AlertDialogDescription>{description}</AlertDialogDescription>
        ) : null}
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          onClick={() => {
            onCancel?.()
          }}
        >
          {cancelText}
        </AlertDialogCancel>
        <AlertDialogAction
          className={
            variant === 'destructive'
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              : undefined
          }
          onClick={() => {
            void onConfirm()
          }}
        >
          {confirmText}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
