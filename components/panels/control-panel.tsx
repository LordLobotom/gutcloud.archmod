'use client'

import React from "react"
import { useState } from 'react'
import { 
  Search, 
  Layers, 
  Filter, 
  ChevronDown,
  Briefcase,
  Server,
  Database,
  Factory,
  Network,
  Shield,
  Target,
  Workflow,
  AppWindow,
  Link,
  RotateCcw,
  Cog,
  Cpu,
  Activity,
  Cylinder,
  TrendingUp,
  FileSpreadsheet,
  Box,
  Plug,
  ArrowRightLeft,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AccountButton } from '@/components/account/account-button'
import type { AuthMode } from '@/lib/config'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { 
  Dimension, 
  EntityType, 
  EntityStatus, 
  FilterState 
} from '@/lib/types'
import { 
  entityTypeConfig, 
  statusConfig
} from '@/lib/types'

interface ControlPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  interactionMode: 'select' | 'add-entity'
  onInteractionModeChange: (mode: 'select' | 'add-entity') => void
  onOpenManager: () => void
  authMode: AuthMode
  userEmail: string | null
  onSignIn: () => void
  onSignOut: () => void
}

const dimensionConfig: Record<Dimension, { 
  label: string
  icon: React.ElementType
  color: string
  description: string
}> = {
  business: { 
    label: 'Business', 
    icon: Briefcase, 
    color: 'text-blue-400',
    description: 'Capabilities & Processes'
  },
  ot: { 
    label: 'OT / Manufacturing', 
    icon: Factory, 
    color: 'text-amber-400',
    description: 'Lines, Machines, PLCs, Signals'
  },
  it: { 
    label: 'IT / Applications', 
    icon: Server, 
    color: 'text-sky-400',
    description: 'Apps, SCADA, MES, ERP'
  },
  data: { 
    label: 'Data', 
    icon: Database, 
    color: 'text-cyan-400',
    description: 'DBs, Historian, Files'
  },
  infrastructure: { 
    label: 'Infrastructure', 
    icon: Network, 
    color: 'text-slate-400',
    description: 'Hosts, Networks, Protocols'
  },
  security: { 
    label: 'Security Zones', 
    icon: Shield, 
    color: 'text-red-400',
    description: 'Purdue Levels, DMZ'
  }
}

const entityIcons: Record<EntityType, React.ElementType> = {
  capability: Target,
  process: Workflow,
  productionLine: Factory,
  machine: Cog,
  plc: Cpu,
  signal: Activity,
  mesFunction: Layers,
  application: AppWindow,
  integration: Link,
  dataObject: Database,
  database: Cylinder,
  timeSeries: TrendingUp,
  file: FileSpreadsheet,
  host: Server,
  container: Box,
  network: Network,
  port: Plug,
  protocol: ArrowRightLeft,
  zone: Shield
}

export function ControlPanel({
  filters,
  onFiltersChange,
  interactionMode,
  onInteractionModeChange,
  onOpenManager,
  authMode,
  userEmail,
  onSignIn,
  onSignOut
}: ControlPanelProps) {
  const [dimensionsOpen, setDimensionsOpen] = useState(true)
  const [typesOpen, setTypesOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  const toggleDimension = (dim: Dimension) => {
    const newDimensions = filters.dimensions.includes(dim)
      ? filters.dimensions.filter(d => d !== dim)
      : [...filters.dimensions, dim]
    onFiltersChange({ ...filters, dimensions: newDimensions })
  }

  const toggleEntityType = (type: EntityType) => {
    const newTypes = filters.entityTypes.includes(type)
      ? filters.entityTypes.filter(t => t !== type)
      : [...filters.entityTypes, type]
    onFiltersChange({ ...filters, entityTypes: newTypes })
  }

  const toggleStatus = (status: EntityStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status]
    onFiltersChange({ ...filters, statuses: newStatuses })
  }

  const toggleZoneCrossings = () => {
    onFiltersChange({ ...filters, showZoneCrossings: !filters.showZoneCrossings })
  }

  const resetFilters = () => {
    onFiltersChange({
      dimensions: [],
      entityTypes: [],
      statuses: [],
      searchQuery: '',
      showZoneCrossings: false,
      zoomLevel: 'low'
    })
  }

  const toggleAddEntityMode = () => {
    onInteractionModeChange(interactionMode === 'add-entity' ? 'select' : 'add-entity')
  }

  const hasActiveFilters = 
    filters.dimensions.length > 0 || 
    filters.entityTypes.length > 0 || 
    filters.statuses.length > 0 ||
    filters.searchQuery.length > 0 ||
    filters.showZoneCrossings

  return (
    <div className="w-80 h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4" />
            EA Explorer
          </h2>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
            <AccountButton
              authMode={authMode}
              userEmail={userEmail}
              onSignIn={onSignIn}
              onSignOut={onSignOut}
            />
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search entities..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            className="pl-9 h-9 bg-muted/50"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex-1 overflow-auto">
        {/* Create */}
        <div className="px-4 py-3">
          <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Create</h3>
          <Button
            variant={interactionMode === 'add-entity' ? 'default' : 'outline'}
            size="sm"
            onClick={toggleAddEntityMode}
            className="w-full justify-center"
          >
            {interactionMode === 'add-entity' ? 'Click on canvas to add' : 'Add Entity'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenManager}
            className="w-full justify-center mt-2"
          >
            Manage Data
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Drag from node handles to create relationships.
          </p>
        </div>

        <Separator />

        {/* Zone Crossing Toggle */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn(
                'w-4 h-4',
                filters.showZoneCrossings ? 'text-red-400' : 'text-muted-foreground'
              )} />
              <Label htmlFor="zone-crossings" className="text-sm font-medium cursor-pointer">
                Highlight Zone Crossings
              </Label>
            </div>
            <Switch
              id="zone-crossings"
              checked={filters.showZoneCrossings}
              onCheckedChange={toggleZoneCrossings}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-6">
            Show OT/IT boundary crossings for NIS2 compliance
          </p>
        </div>

        <Separator />

        {/* Dimensions */}
        <Collapsible open={dimensionsOpen} onOpenChange={setDimensionsOpen}>
          <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Dimensions
              {filters.dimensions.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {filters.dimensions.length}
                </Badge>
              )}
            </span>
            <ChevronDown className={cn(
              'w-4 h-4 text-muted-foreground transition-transform',
              dimensionsOpen && 'rotate-180'
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-3 space-y-1">
              {(Object.entries(dimensionConfig) as [Dimension, typeof dimensionConfig[Dimension]][]).map(([key, config]) => {
                const Icon = config.icon
                const isActive = filters.dimensions.includes(key)
                return (
                  <button
                    key={key}
                    onClick={() => toggleDimension(key)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                      isActive 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? config.color : 'text-muted-foreground')} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm', isActive ? 'text-foreground font-medium' : 'text-foreground')}>
                        {config.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {config.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Entity Types */}
        <Collapsible open={typesOpen} onOpenChange={setTypesOpen}>
          <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Entity Types
              {filters.entityTypes.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {filters.entityTypes.length}
                </Badge>
              )}
            </span>
            <ChevronDown className={cn(
              'w-4 h-4 text-muted-foreground transition-transform',
              typesOpen && 'rotate-180'
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-3">
              {/* Group by dimension */}
              {(Object.entries(dimensionConfig) as [Dimension, typeof dimensionConfig[Dimension]][]).map(([dimKey, dimConfig]) => {
                const DimIcon = dimConfig.icon
                const typesInDimension = (Object.entries(entityTypeConfig) as [EntityType, typeof entityTypeConfig[EntityType]][])
                  .filter(([, config]) => config.dimension === dimKey)
                
                if (typesInDimension.length === 0) return null
                
                return (
                  <div key={dimKey} className="mb-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <DimIcon className={cn('w-3 h-3', dimConfig.color)} />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {dimConfig.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {typesInDimension.map(([key, config]) => {
                        const Icon = entityIcons[key]
                        const isActive = filters.entityTypes.includes(key)
                        return (
                          <button
                            key={key}
                            onClick={() => toggleEntityType(key)}
                            className={cn(
                              'flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left',
                              isActive 
                                ? cn(config.bgColor, config.borderColor, 'border') 
                                : 'hover:bg-muted/50'
                            )}
                          >
                            <Icon className={cn('w-3 h-3', isActive ? config.color : 'text-muted-foreground')} />
                            <span className={cn('text-xs truncate', isActive ? 'text-foreground font-medium' : 'text-foreground')}>
                              {config.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Status */}
        <Collapsible open={statusOpen} onOpenChange={setStatusOpen}>
          <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              Status
              {filters.statuses.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {filters.statuses.length}
                </Badge>
              )}
            </span>
            <ChevronDown className={cn(
              'w-4 h-4 text-muted-foreground transition-transform',
              statusOpen && 'rotate-180'
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-3 flex flex-wrap gap-1.5">
              {(Object.entries(statusConfig) as [EntityStatus, typeof statusConfig[EntityStatus]][]).map(([key, config]) => {
                const isActive = filters.statuses.includes(key)
                return (
                  <button
                    key={key}
                    onClick={() => toggleStatus(key)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs transition-colors',
                      isActive 
                        ? cn(config.bgColor, config.color, 'font-medium') 
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {config.label}
                  </button>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Dimension Colors</p>
        <div className="grid grid-cols-2 gap-1">
          {(Object.entries(dimensionConfig) as [Dimension, typeof dimensionConfig[Dimension]][]).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={cn('w-2 h-2 rounded-full', config.color.replace('text-', 'bg-'))} />
              <span className="text-xs text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
