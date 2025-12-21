/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { Outlet, createRootRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import {
  useBackendBaseUrl,
  useConfig,
  useDebugMode,
  useEnvironment,
} from '@/hooks/useConfig'
import { useLanguageSync } from '@/hooks/useLanguageSync'
import { CommandPalette } from '@/components/CommandPalette'

export const Route = createRootRoute({
  component: () => {
    const config = useConfig()
    const debugMode = useDebugMode()
    const backendBaseUrl = useBackendBaseUrl()
    const environment = useEnvironment()

    // Sync language between configStore, globalStore, and i18next
    useLanguageSync()

    // Log configuration in debug mode
    useEffect(() => {
      if (debugMode && config) {
        console.log('🔧 Application Configuration')
        console.log('  Backend Base URL (build-time):', backendBaseUrl)
        console.log('  Environment (build-time):', environment)
        console.log('  Debug Mode (build-time):', debugMode)
        console.log('  Language (runtime):', config.language_iso639_1)
        console.log('  Auth Type (runtime):', config.authType)
        console.log('  Login Endpoint (runtime):', config.loginEndpoint)
        console.log('  Full Config:', config)
      }
    }, [config, debugMode, backendBaseUrl, environment])

    return (
      <>
        {/* Header and Footer are rendered by individual layouts */}
        <Outlet />
        {/* Global command palette (⌘K / Ctrl+K) */}
        <CommandPalette />
        {/* {debugMode && (*/}
        {/*  <TanStackDevtools*/}
        {/*    config={{*/}
        {/*      position: 'bottom-right',*/}
        {/*    }}*/}
        {/*    plugins={[*/}
        {/*      {*/}
        {/*        name: 'Tanstack Router',*/}
        {/*        render: <TanStackRouterDevtoolsPanel />,*/}
        {/*      },*/}
        {/*    ]}*/}
        {/*  />*/}
        {/* )}*/}
      </>
    )
  },
})
