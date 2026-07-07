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
 * App-wide, non-dismissible warning while no plugin is loaded — shown
 * regardless of guide status; the app cannot forecast in this state.
 */

import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { TriangleAlert } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { useBlockCatalogue } from '@/api/hooks/useFable'
import { useCanManagePlugins } from '@/features/onboarding/hooks/useCanManagePlugins'

export function NoPluginsBanner() {
  const { t } = useTranslation('onboarding')
  const canManagePlugins = useCanManagePlugins()
  const catalogue = useBlockCatalogue()

  const catalogueReady =
    !!catalogue.data && Object.keys(catalogue.data).length > 0
  const catalogueSettled = catalogue.isSuccess || catalogue.isError

  if (!catalogueSettled || catalogueReady) return null

  return (
    <div className="px-4 pt-4 sm:px-6 lg:px-8">
      <Alert variant="destructive">
        <TriangleAlert />
        <AlertTitle>
          {canManagePlugins ? (
            <>
              {t('banner.noPluginsAdmin')}{' '}
              <Link to="/admin/plugins">
                {t('banner.noPluginsAdminAction')}
              </Link>
            </>
          ) : (
            t('banner.noPluginsUser')
          )}
        </AlertTitle>
      </Alert>
    </div>
  )
}
