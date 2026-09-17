import type { ComponentType, ReactNode } from 'react'

export interface OverlayComponentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface AlertDialogOptions {
  title: ReactNode
  description?: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

export type SheetComponent = ComponentType<
  OverlayComponentProps & { children?: ReactNode }
>

export type DialogComponent = ComponentType<
  OverlayComponentProps & { children?: ReactNode }
>

export type AlertDialogComponent = ComponentType<
  OverlayComponentProps & AlertDialogOptions
>

export interface OverlayStackProviderProps {
  /** Your app's Sheet component (e.g. shadcn/ui's `Sheet`). */
  sheet: SheetComponent
  /** Your app's Dialog component (e.g. shadcn/ui's `Dialog`). */
  dialog: DialogComponent
  /** Your app's AlertDialog component, receiving `AlertDialogOptions` as props. */
  alertDialog: AlertDialogComponent
  children?: ReactNode
}

export interface OverlayStackApi {
  /** Render `content` in the global sheet and open it. Pass `null` to close. */
  setSheet: (content: ReactNode | null) => void
  /** Render `content` in the global dialog and open it. Pass `null` to close. */
  setDialog: (content: ReactNode | null) => void
  /** Configure and open the global alert dialog. Pass `null` to close. */
  setAlertDialog: (options: AlertDialogOptions | null) => void
  /** Close the sheet, dialog, and alert dialog at once. */
  closeAll: () => void
}
