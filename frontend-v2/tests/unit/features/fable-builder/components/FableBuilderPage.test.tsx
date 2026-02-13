/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import type {
  BlockFactoryCatalogue,
  FableBuilderV1,
} from '@/api/types/fable.types'
import { FableBuilderPage } from '@/features/fable-builder/components/FableBuilderPage'
import { useFableBuilderStore } from '@/features/fable-builder/stores/fableBuilderStore'

// Mock API hooks
const mockCatalogue: BlockFactoryCatalogue = {
  'ecmwf/test-plugin': {
    factories: {
      'source-factory': {
        kind: 'source',
        title: 'Test Source',
        description: 'A test source',
        configuration_options: {},
        inputs: [],
      },
    },
  },
}

const mockFable: FableBuilderV1 = {
  blocks: {
    'block-1': {
      factory_id: {
        plugin: { store: 'ecmwf', local: 'test-plugin' },
        factory: 'source-factory',
      },
      configuration_values: {},
      input_ids: {},
    },
  },
}

vi.mock('@/api/hooks/useFable', () => ({
  useBlockCatalogue: vi.fn(() => ({
    data: mockCatalogue,
    isLoading: false,
  })),
  useFable: vi.fn((id: string | null) => ({
    data: id ? mockFable : null,
    isLoading: false,
    error: null,
  })),
  useFableValidation: vi.fn(() => ({
    data: null,
    isLoading: false,
    isFetching: false,
  })),
}))

// Mock components
vi.mock('@/features/fable-builder/components/FableBuilderHeader', () => ({
  FableBuilderHeader: ({ fableId }: { fableId?: string }) => (
    <div data-testid="fable-header">Header {fableId ?? 'new'}</div>
  ),
}))

vi.mock('@/features/fable-builder/components/layout', () => ({
  BlockPalette: () => <div data-testid="block-palette">Block Palette</div>,
  ConfigPanel: () => <div data-testid="config-panel">Config Panel</div>,
  MobileLayout: ({
    canvas,
  }: {
    catalogue: BlockFactoryCatalogue
    canvas: React.ReactNode
  }) => (
    <div data-testid="mobile-layout">
      Mobile Layout
      <div data-testid="mobile-canvas">{canvas}</div>
    </div>
  ),
  ThreeColumnLayout: ({
    leftSidebar,
    canvas,
    rightSidebar,
  }: {
    leftSidebar: React.ReactNode
    canvas: React.ReactNode
    rightSidebar: React.ReactNode
  }) => (
    <div data-testid="three-column-layout">
      <div data-testid="left-sidebar">{leftSidebar}</div>
      <div data-testid="canvas">{canvas}</div>
      <div data-testid="right-sidebar">{rightSidebar}</div>
    </div>
  ),
}))

vi.mock('@/features/fable-builder/components/graph-mode', () => ({
  FableGraphCanvas: () => <div data-testid="graph-canvas">Graph Canvas</div>,
}))

vi.mock('@/features/fable-builder/components/form-mode', () => ({
  FableFormCanvas: () => <div data-testid="form-canvas">Form Canvas</div>,
}))

vi.mock('@/features/fable-builder/components/review', () => ({
  ReviewStep: () => <div data-testid="review-step">Review Step</div>,
}))

vi.mock('@/features/fable-builder/hooks/useURLStateSync', () => ({
  useURLStateSync: vi.fn(() => ({ loadedFromURL: false })),
}))

// Mock useMedia hook
vi.mock('@/hooks/useMedia', () => ({
  useMedia: vi.fn(() => true), // Default to desktop
}))

// Mock auth hooks used by EditStep
vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ authType: 'anonymous', isAuthenticated: true }),
}))

vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({ data: { is_superuser: true } }),
}))

describe('FableBuilderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFableBuilderStore.setState({
      fable: { blocks: {} },
      mode: 'graph',
      step: 'edit',
      validationState: null,
      isValidating: false,
    })
  })

  afterEach(() => {
    // Don't call reset() here as it causes components to crash during cleanup
    useFableBuilderStore.setState({
      validationState: null,
      isValidating: false,
    })
  })

  describe('rendering', () => {
    it('renders header', async () => {
      const screen = await render(<FableBuilderPage />)

      await expect
        .element(screen.getByTestId('fable-header'))
        .toBeInTheDocument()
    })

    it('renders three column layout on desktop', async () => {
      const screen = await render(<FableBuilderPage />)

      await expect
        .element(screen.getByTestId('three-column-layout'))
        .toBeInTheDocument()
    })

    it('renders block palette in left sidebar', async () => {
      const screen = await render(<FableBuilderPage />)

      await expect
        .element(screen.getByTestId('block-palette'))
        .toBeInTheDocument()
    })

    it('renders config panel in right sidebar', async () => {
      const screen = await render(<FableBuilderPage />)

      await expect
        .element(screen.getByTestId('config-panel'))
        .toBeInTheDocument()
    })
  })

  describe('mode switching', () => {
    it('renders graph canvas in graph mode', async () => {
      useFableBuilderStore.setState({ mode: 'graph' })

      const screen = await render(<FableBuilderPage />)

      await expect
        .element(screen.getByTestId('graph-canvas'))
        .toBeInTheDocument()
    })

    it('renders form canvas in form mode', async () => {
      useFableBuilderStore.setState({ mode: 'form' })

      const screen = await render(<FableBuilderPage />)

      await expect
        .element(screen.getByTestId('form-canvas'))
        .toBeInTheDocument()
    })
  })

  describe('step switching', () => {
    it('renders edit step content when step is edit', async () => {
      useFableBuilderStore.setState({ step: 'edit' })

      const screen = await render(<FableBuilderPage />)

      await expect
        .element(screen.getByTestId('three-column-layout'))
        .toBeInTheDocument()
    })

    it('renders review step when step is review', async () => {
      // Mock newFable to not reset step (newFable is called during init)
      const originalNewFable = useFableBuilderStore.getState().newFable
      useFableBuilderStore.setState({
        step: 'review',
        newFable: () => {
          // Don't reset step when newFable is called during mount
          useFableBuilderStore.setState({ fable: { blocks: {} } })
        },
      })

      const screen = await render(<FableBuilderPage />)

      await expect
        .element(screen.getByTestId('review-step'))
        .toBeInTheDocument()

      // Restore original
      useFableBuilderStore.setState({ newFable: originalNewFable })
    })
  })

  describe('mobile layout', () => {
    it('renders mobile layout on small screens', async () => {
      const { useMedia } = await import('@/hooks/useMedia')
      vi.mocked(useMedia).mockReturnValue(false) // Mobile

      const screen = await render(<FableBuilderPage />)

      await expect
        .element(screen.getByTestId('mobile-layout'))
        .toBeInTheDocument()
    })
  })

  describe('loading states', () => {
    it('shows loading spinner when catalogue is loading', async () => {
      const { useBlockCatalogue } = await import('@/api/hooks/useFable')
      vi.mocked(useBlockCatalogue).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as ReturnType<typeof useBlockCatalogue>)

      const screen = await render(<FableBuilderPage />)

      // Should show loading spinner
      const spinner = screen.container.querySelector(
        '[data-testid="loading-spinner"], .animate-spin',
      )
      expect(spinner || screen.container.querySelector('svg')).toBeTruthy()
    })

    it('shows loading spinner when fable is loading', async () => {
      const { useFable } = await import('@/api/hooks/useFable')
      vi.mocked(useFable).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as ReturnType<typeof useFable>)

      const screen = await render(<FableBuilderPage fableId="test-id" />)

      const spinner = screen.container.querySelector(
        '[data-testid="loading-spinner"], .animate-spin',
      )
      expect(spinner || screen.container.querySelector('svg')).toBeTruthy()
    })
  })

  describe('error states', () => {
    it('shows error when fable fails to load', async () => {
      const { useFable, useBlockCatalogue } =
        await import('@/api/hooks/useFable')
      vi.mocked(useBlockCatalogue).mockReturnValue({
        data: mockCatalogue,
        isLoading: false,
      } as ReturnType<typeof useBlockCatalogue>)
      vi.mocked(useFable).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
      } as ReturnType<typeof useFable>)

      const screen = await render(<FableBuilderPage fableId="test-id" />)

      expect(screen.container.textContent).toContain(
        'Failed to load configuration',
      )
    })

    it('shows error when catalogue fails to load', async () => {
      const { useBlockCatalogue } = await import('@/api/hooks/useFable')
      vi.mocked(useBlockCatalogue).mockReturnValue({
        data: undefined,
        isLoading: false,
      } as ReturnType<typeof useBlockCatalogue>)

      const screen = await render(<FableBuilderPage />)

      expect(screen.container.textContent).toContain(
        'Failed to load block catalogue',
      )
    })
  })

  describe('fable ID handling', () => {
    it('passes fableId to header', async () => {
      const { useFable, useBlockCatalogue } =
        await import('@/api/hooks/useFable')
      vi.mocked(useBlockCatalogue).mockReturnValue({
        data: mockCatalogue,
        isLoading: false,
      } as ReturnType<typeof useBlockCatalogue>)
      vi.mocked(useFable).mockReturnValue({
        data: mockFable,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useFable>)

      const screen = await render(<FableBuilderPage fableId="test-fable-123" />)

      expect(screen.container.textContent).toContain('test-fable-123')
    })
  })
})
