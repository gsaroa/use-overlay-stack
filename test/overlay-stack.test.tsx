import { render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { OverlayStackProvider } from '../src/overlay-stack-provider'
import type { AlertDialogOptions, OverlayComponentProps } from '../src/types'
import { useOverlayStack } from '../src/use-overlay-stack'

function FakeSheet({
  open,
  children,
}: OverlayComponentProps & { children?: ReactNode }) {
  // Real overlay libraries (Radix, etc.) keep content mounted while closing
  // so exit animations can play — this fake mirrors that instead of
  // unmounting on `open === false`.
  return (
    <div data-testid="sheet" data-open={open}>
      {children}
    </div>
  )
}

function FakeDialog({
  open,
  children,
}: OverlayComponentProps & { children?: ReactNode }) {
  return (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  )
}

function FakeAlertDialog({
  open,
  onOpenChange,
  title,
  onConfirm,
}: OverlayComponentProps & AlertDialogOptions) {
  return (
    <div data-testid="alert" data-open={open}>
      <span>{title}</span>
      <button
        type="button"
        onClick={() => {
          onConfirm()
          onOpenChange(false)
        }}
      >
        confirm
      </button>
    </div>
  )
}

function renderWithProvider(children: ReactNode) {
  return render(
    <OverlayStackProvider
      sheet={FakeSheet}
      dialog={FakeDialog}
      alertDialog={FakeAlertDialog}
    >
      {children}
    </OverlayStackProvider>
  )
}

function Harness() {
  const { setSheet, setDialog, setAlertDialog, closeAll } = useOverlayStack()
  return (
    <div>
      <button type="button" onClick={() => setSheet(<p>sheet body</p>)}>
        open-sheet
      </button>
      <button type="button" onClick={() => setSheet(null)}>
        close-sheet
      </button>
      <button type="button" onClick={() => setDialog(<p>dialog body</p>)}>
        open-dialog
      </button>
      <button
        type="button"
        onClick={() =>
          setAlertDialog({ title: 'Delete item?', onConfirm: () => {} })
        }
      >
        open-alert
      </button>
      <button type="button" onClick={closeAll}>
        close-all
      </button>
    </div>
  )
}

describe('OverlayStackProvider / useOverlayStack', () => {
  it('starts with every overlay closed', () => {
    renderWithProvider(<Harness />)
    expect(screen.getByTestId('sheet')).toHaveAttribute('data-open', 'false')
    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'false')
    expect(screen.getByTestId('alert')).toHaveAttribute('data-open', 'false')
  })

  it('opens the sheet with the given content', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Harness />)

    await user.click(screen.getByText('open-sheet'))

    expect(screen.getByTestId('sheet')).toHaveAttribute('data-open', 'true')
    expect(screen.getByText('sheet body')).toBeInTheDocument()
  })

  it('keeps content mounted after close so exit animations can run', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Harness />)

    await user.click(screen.getByText('open-sheet'))
    await user.click(screen.getByText('close-sheet'))

    expect(screen.getByTestId('sheet')).toHaveAttribute('data-open', 'false')
    expect(screen.getByText('sheet body')).toBeInTheDocument()
  })

  it('lets the sheet and dialog be open independently', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Harness />)

    await user.click(screen.getByText('open-sheet'))
    await user.click(screen.getByText('open-dialog'))

    expect(screen.getByTestId('sheet')).toHaveAttribute('data-open', 'true')
    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true')
  })

  it('drives the alert dialog from options and runs onConfirm', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Harness />)

    await user.click(screen.getByText('open-alert'))
    expect(screen.getByText('Delete item?')).toBeInTheDocument()

    await user.click(screen.getByText('confirm'))
    expect(screen.getByTestId('alert')).toHaveAttribute('data-open', 'false')
  })

  it('closeAll closes every overlay at once', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Harness />)

    await user.click(screen.getByText('open-sheet'))
    await user.click(screen.getByText('open-dialog'))
    await user.click(screen.getByText('close-all'))

    expect(screen.getByTestId('sheet')).toHaveAttribute('data-open', 'false')
    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'false')
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useOverlayStack())).toThrow(
      /must be called within/
    )
  })
})
