import { useContext } from 'react'
import { OverlayStackContext } from './overlay-stack-provider'
import type { OverlayStackApi } from './types'

/**
 * Access the global sheet/dialog/alert-dialog controls set up by
 * `<OverlayStackProvider>`. Must be called from within that provider.
 */
export function useOverlayStack(): OverlayStackApi {
  const ctx = useContext(OverlayStackContext)
  if (!ctx) {
    throw new Error(
      'useOverlayStack() must be called within an <OverlayStackProvider>'
    )
  }
  return ctx
}
