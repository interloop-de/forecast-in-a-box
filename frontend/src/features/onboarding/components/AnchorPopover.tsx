/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

/**
 * Popover + highlight ring on a `[data-onboarding=…]` element. Uses the Base
 * UI primitive directly (wrapped PopoverContent has no detached anchor); the
 * ring is pointer-transparent so the target stays clickable.
 */

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { Button } from '@/components/ui/button'
import { useOnboardingAnchor } from '@/features/onboarding/hooks/useOnboardingAnchor'

interface AnchorPopoverProps {
  selector: string
  title: string
  body: string
}

export function AnchorPopover({ selector, title, body }: AnchorPopoverProps) {
  const { t } = useTranslation('onboarding')
  const [dismissed, setDismissed] = useState(false)
  const { element, rect } = useOnboardingAnchor(selector)

  if (dismissed || !element) return null

  return (
    <>
      {rect &&
        createPortal(
          <div
            aria-hidden
            className="pointer-events-none fixed z-40 animate-in rounded-lg ring-2 ring-primary/70 fade-in-0"
            style={{
              top: rect.top - 4,
              left: rect.left - 4,
              width: rect.width + 8,
              height: rect.height + 8,
            }}
          />,
          document.body,
        )}
      <PopoverPrimitive.Root
        open
        onOpenChange={(open) => {
          if (!open) setDismissed(true)
        }}
      >
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Positioner
            anchor={element}
            side="bottom"
            sideOffset={10}
            className="isolate z-50"
          >
            <PopoverPrimitive.Popup className="z-50 flex w-72 origin-(--transform-origin) flex-col gap-3 rounded-md bg-popover p-4 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95">
              <div className="flex flex-col gap-1">
                <PopoverPrimitive.Title className="font-medium">
                  {title}
                </PopoverPrimitive.Title>
                <PopoverPrimitive.Description className="text-muted-foreground">
                  {body}
                </PopoverPrimitive.Description>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => setDismissed(true)}
                >
                  {t('popovers.dismiss')}
                </Button>
              </div>
            </PopoverPrimitive.Popup>
          </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </>
  )
}
