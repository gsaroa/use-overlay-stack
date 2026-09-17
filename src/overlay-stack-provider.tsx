'use client'

import type { ReactNode } from 'react'
import { createContext, useCallback, useMemo, useState } from 'react'
import type {
  AlertDialogOptions,
  OverlayStackApi,
  OverlayStackProviderProps,
} from './types'

const NOOP_ALERT_OPTIONS: AlertDialogOptions = {
  title: '',
  onConfirm: () => {},
}

export const OverlayStackContext = createContext<OverlayStackApi | null>(null)

interface ContentState {
  content: ReactNode
  open: boolean
}

interface AlertState {
  options: AlertDialogOptions | null
  open: boolean
}

/**
 * Mounts a single Sheet, Dialog, and AlertDialog instance for the whole
 * subtree and exposes them via `useOverlayStack()`. Content stays mounted
 * while `open` flips to `false` so your components' own close/exit
 * animations still play out.
 */
export function OverlayStackProvider({
  sheet: Sheet,
  dialog: Dialog,
  alertDialog: AlertDialog,
  children,
}: OverlayStackProviderProps) {
  const [sheetState, setSheetState] = useState<ContentState>({
    content: null,
    open: false,
  })
  const [dialogState, setDialogState] = useState<ContentState>({
    content: null,
    open: false,
  })
  const [alertState, setAlertState] = useState<AlertState>({
    options: null,
    open: false,
  })

  const setSheet = useCallback((content: ReactNode | null) => {
    setSheetState((prev) =>
      content === null ? { ...prev, open: false } : { content, open: true }
    )
  }, [])

  const setDialog = useCallback((content: ReactNode | null) => {
    setDialogState((prev) =>
      content === null ? { ...prev, open: false } : { content, open: true }
    )
  }, [])

  const setAlertDialog = useCallback((options: AlertDialogOptions | null) => {
    setAlertState((prev) =>
      options === null ? { ...prev, open: false } : { options, open: true }
    )
  }, [])

  const closeAll = useCallback(() => {
    setSheetState((prev) => ({ ...prev, open: false }))
    setDialogState((prev) => ({ ...prev, open: false }))
    setAlertState((prev) => ({ ...prev, open: false }))
  }, [])

  const api = useMemo<OverlayStackApi>(
    () => ({ setSheet, setDialog, setAlertDialog, closeAll }),
    [setSheet, setDialog, setAlertDialog, closeAll]
  )

  const activeAlertOptions = alertState.options ?? NOOP_ALERT_OPTIONS

  return (
    <OverlayStackContext.Provider value={api}>
      {children}
      <Sheet
        open={sheetState.open}
        onOpenChange={(open) => setSheetState((prev) => ({ ...prev, open }))}
      >
        {sheetState.content}
      </Sheet>
      <Dialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
      >
        {dialogState.content}
      </Dialog>
      <AlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState((prev) => ({ ...prev, open }))}
        {...activeAlertOptions}
      />
    </OverlayStackContext.Provider>
  )
}
