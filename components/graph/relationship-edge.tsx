'use client'

import { memo } from 'react'
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  getBezierPath, 
  type EdgeProps 
} from '@xyflow/react'
import type { Relationship } from '@/lib/types'
import { relationshipTypeConfig } from '@/lib/types'
import { AlertTriangle } from 'lucide-react'

interface RelationshipEdgeData extends Relationship {
  showLabel?: boolean
  highlightZoneCrossing?: boolean
}

function RelationshipEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected
}: EdgeProps<RelationshipEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  })

  const config = data?.type ? relationshipTypeConfig[data.type] : null
  const isZoneCrossing = data?.crossesZone || data?.type === 'crosses_zone'
  
  // Zone crossings get special red/orange styling when highlighted
  const strokeColor = isZoneCrossing && data?.highlightZoneCrossing 
    ? '#ef4444' 
    : config?.color || '#64748b'
  
  const strokeDasharray = config?.style === 'dashed' 
    ? '5 5' 
    : config?.style === 'dotted' 
      ? '2 2' 
      : undefined

  const strokeWidth = data?.strength === 'strong' 
    ? 2.5 
    : data?.strength === 'weak' 
      ? 1 
      : 1.5

  // Zone crossings get thicker stroke and glow effect
  const finalStrokeWidth = isZoneCrossing && data?.highlightZoneCrossing 
    ? strokeWidth + 1.5 
    : selected 
      ? strokeWidth + 1 
      : strokeWidth

  const showLabel = Boolean((data?.showLabel || selected) && config && !isZoneCrossing)

  return (
    <>
      {/* Glow effect for zone crossings */}
      {isZoneCrossing && data?.highlightZoneCrossing && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: '#ef4444',
            strokeWidth: finalStrokeWidth + 4,
            strokeDasharray,
            opacity: 0.3,
            filter: 'blur(4px)'
          }}
        />
      )}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: finalStrokeWidth,
          strokeDasharray,
          opacity: selected ? 1 : isZoneCrossing && data?.highlightZoneCrossing ? 0.9 : 0.6
        }}
        markerEnd={`url(#arrow-${data?.type || 'default'})`}
      />
      {/* Zone crossing indicator */}
      {isZoneCrossing && data?.highlightZoneCrossing && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all'
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/90 border border-red-400 rounded-full text-white font-medium shadow-lg shadow-red-500/20"
          >
            <AlertTriangle className="w-3 h-3" />
            Zone Crossing
          </div>
        </EdgeLabelRenderer>
      )}
      {/* Regular label */}
      {showLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all'
            }}
            className="px-2 py-0.5 text-xs bg-background/90 border border-border rounded-full text-muted-foreground"
          >
            {config.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export const RelationshipEdge = memo(RelationshipEdgeComponent)
