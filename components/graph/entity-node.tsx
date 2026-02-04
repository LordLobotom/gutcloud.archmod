'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { 
  Target, 
  Workflow, 
  AppWindow, 
  Server, 
  Database, 
  Link,
  ChevronDown,
  ChevronRight,
  Factory,
  Cog,
  Cpu,
  Activity,
  Layers,
  Cylinder,
  TrendingUp,
  FileSpreadsheet,
  Box,
  Network,
  Plug,
  ArrowRightLeft,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Entity } from '@/lib/types'
import { entityTypeConfig, statusConfig, zoneTypeConfig, type ZoneType } from '@/lib/types'

const iconMap = {
  target: Target,
  workflow: Workflow,
  'app-window': AppWindow,
  server: Server,
  database: Database,
  link: Link,
  factory: Factory,
  cog: Cog,
  cpu: Cpu,
  activity: Activity,
  layers: Layers,
  cylinder: Cylinder,
  'trending-up': TrendingUp,
  'file-spreadsheet': FileSpreadsheet,
  box: Box,
  network: Network,
  plug: Plug,
  'arrow-right-left': ArrowRightLeft,
  shield: Shield
}

interface EntityNodeData extends Entity {
  expanded?: boolean
  selected?: boolean
  onExpand?: (id: string) => void
  onClick?: (entity: Entity) => void
  zoneType?: ZoneType
}

function EntityNodeComponent({ data }: NodeProps<EntityNodeData>) {
  const config = entityTypeConfig[data.type]
  const status = statusConfig[data.status]
  const Icon = iconMap[config.icon as keyof typeof iconMap] || Target
  const hasChildren = data.children && data.children.length > 0
  
  // Special styling for zone entities
  const isZone = data.type === 'zone'
  const zoneConfig = isZone && data.zoneType ? zoneTypeConfig[data.zoneType] : null

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-muted-foreground/50 !border-0"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-muted-foreground/50 !border-0"
      />
      <div
        className={cn(
          'group relative px-4 py-3 rounded-lg border-2 transition-all duration-200 cursor-pointer min-w-[140px] max-w-[220px]',
          isZone ? (zoneConfig?.bgColor || config.bgColor) : config.bgColor,
          config.borderColor,
          data.selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
          'hover:scale-105 hover:shadow-lg hover:shadow-black/20'
        )}
        onClick={() => data.onClick?.(data)}
      >
        <div className="flex items-start gap-2">
          <div className={cn('p-1.5 rounded-md', config.bgColor)}>
            <Icon className={cn('w-4 h-4', config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-foreground truncate leading-tight">
              {data.name}
            </h3>
            <div className="flex items-center gap-1.5">
              <span className={cn('text-xs', status.color)}>
                {status.label}
              </span>
              {data.zoneId && !isZone && (
                <span className="text-xs text-muted-foreground/70">
                  {data.zoneId.replace('zone-', 'L')}
                </span>
              )}
            </div>
          </div>
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                data.onExpand?.(data.id)
              }}
              className="p-0.5 rounded hover:bg-white/10 transition-colors"
            >
              {data.expanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
        
        {/* Criticality indicator */}
        {data.criticality === 'critical' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
        {data.criticality === 'high' && (
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full" />
        )}
        
        {/* Dimension indicator */}
        <div className={cn(
          'absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide',
          config.bgColor,
          config.color
        )}>
          {config.dimension}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-muted-foreground/50 !border-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-muted-foreground/50 !border-0"
      />
    </>
  )
}

export const EntityNode = memo(EntityNodeComponent)
