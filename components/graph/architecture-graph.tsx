'use client'

import React from "react"
import { useCallback, useMemo, useState, useEffect } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type NodeChange,
  type Connection,
  ConnectionMode,
  Panel
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { EntityNode } from './entity-node'
import { RelationshipEdge } from './relationship-edge'
import type { Entity, EntityType, FilterState, Dimension, Relationship } from '@/lib/types'
import { entityTypeConfig, relationshipTypeConfig, semanticZoomConfig } from '@/lib/types'
import { getInitialPositions, isZoneCrossing } from '@/lib/mock-data'

const nodeTypes: NodeTypes = {
  entity: EntityNode
}

const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge
}

// Map dimensions to entity types
const dimensionTypeMap: Record<Dimension, EntityType[]> = {
  business: ['capability', 'process'],
  ot: ['productionLine', 'machine', 'plc', 'signal', 'mesFunction'],
  it: ['application', 'integration'],
  data: ['dataObject', 'database', 'timeSeries', 'file'],
  infrastructure: ['host', 'container', 'network', 'port', 'protocol'],
  security: ['zone']
}

interface ArchitectureGraphProps {
  filters: FilterState
  entities: Entity[]
  relationships: Relationship[]
  onSelectEntity: (entity: Entity | null) => void
  onSelectRelationship: (relationship: Relationship | null) => void
  selectedEntityId: string | null
  selectedRelationshipId: string | null
  connectionFocus: { incoming: boolean; outgoing: boolean }
  interactionMode: 'select' | 'add-entity'
  onAddEntityAtPosition: (position: { x: number; y: number }) => void
  onCreateRelationship: (sourceId: string, targetId: string) => void
  onEntityPositionsChange: (updates: Array<{ id: string; position: { x: number; y: number } }>) => void
}

function ArchitectureGraphInner({ 
  filters, 
  entities,
  relationships,
  onSelectEntity, 
  onSelectRelationship,
  selectedEntityId,
  selectedRelationshipId,
  connectionFocus,
  interactionMode,
  onAddEntityAtPosition,
  onCreateRelationship,
  onEntityPositionsChange
}: ArchitectureGraphProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const { screenToFlowPosition } = useReactFlow()
  const entityMap = useMemo(() => new Map(entities.map(entity => [entity.id, entity])), [entities])
  const defaultPositions = useMemo(() => getInitialPositions(entities), [entities])

  // Get position for an entity (saved or default)
  const getPosition = useCallback((entityId: string) => {
    const entity = entityMap.get(entityId)
    return entity?.position || defaultPositions[entityId] || { x: 0, y: 0 }
  }, [entityMap, defaultPositions])

  // Get entity types allowed by semantic zoom
  const zoomAllowedTypes = useMemo(() => {
    return semanticZoomConfig[filters.zoomLevel]
  }, [filters.zoomLevel])

  // Filter entities based on current filters
  const filteredEntities = useMemo(() => {
    return entities.filter(entity => {
      // Semantic zoom filter
      if (!zoomAllowedTypes.includes(entity.type)) {
        return false
      }
      
      // Entity type filter
      if (filters.entityTypes.length > 0 && !filters.entityTypes.includes(entity.type)) {
        return false
      }
      
      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(entity.status)) {
        return false
      }
      
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        return (
          entity.name.toLowerCase().includes(query) ||
          entity.description.toLowerCase().includes(query) ||
          entity.tags.some(tag => tag.toLowerCase().includes(query))
        )
      }
      
      // Dimension filtering
      if (filters.dimensions.length > 0) {
        const allowedTypes = filters.dimensions.flatMap(d => dimensionTypeMap[d])
        if (!allowedTypes.includes(entity.type)) {
          return false
        }
      }
      
      return true
    })
  }, [filters, zoomAllowedTypes])

  const focusEntityIds = useMemo(() => {
    if (!selectedEntityId) return null
    if (!connectionFocus.incoming && !connectionFocus.outgoing) return null

    const visibleEntityIds = new Set(filteredEntities.map(entity => entity.id))
    if (!visibleEntityIds.has(selectedEntityId)) return null

    const ids = new Set<string>([selectedEntityId])
    relationships.forEach(rel => {
      if (connectionFocus.outgoing && rel.fromEntityId === selectedEntityId) {
        ids.add(rel.toEntityId)
      }
      if (connectionFocus.incoming && rel.toEntityId === selectedEntityId) {
        ids.add(rel.fromEntityId)
      }
    })
    return ids
  }, [
    selectedEntityId,
    connectionFocus.incoming,
    connectionFocus.outgoing,
    filteredEntities,
    relationships
  ])

  // Count zone crossings
  const zoneCrossingCount = useMemo(() => {
    return relationships.filter(rel => isZoneCrossing(rel, entities)).length
  }, [relationships, entities])

  const visibleEntities = useMemo(() => {
    if (!focusEntityIds) return filteredEntities
    return filteredEntities.filter(entity => focusEntityIds.has(entity.id))
  }, [filteredEntities, focusEntityIds])

  // Create nodes from filtered entities
  const initialNodes: Node[] = useMemo(() => {
    return visibleEntities.map(entity => ({
      id: entity.id,
      type: 'entity',
      position: getPosition(entity.id),
      data: {
        ...entity,
        expanded: expandedNodes.has(entity.id),
        selected: entity.id === selectedEntityId,
        onExpand: (id: string) => {
          setExpandedNodes(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
              next.delete(id)
            } else {
              next.add(id)
            }
            return next
          })
        },
        onClick: (e: Entity) => onSelectEntity(e)
      }
    }))
  }, [visibleEntities, getPosition, expandedNodes, selectedEntityId, onSelectEntity])

  // Create edges from relationships
  const initialEdges: Edge[] = useMemo(() => {
    const entityIds = new Set(visibleEntities.map(e => e.id))
    return relationships
      .filter(rel => entityIds.has(rel.fromEntityId) && entityIds.has(rel.toEntityId))
      .filter(rel => {
        if (!focusEntityIds || !selectedEntityId) return true
        const isIncoming = rel.toEntityId === selectedEntityId
        const isOutgoing = rel.fromEntityId === selectedEntityId
        return (
          (connectionFocus.incoming && isIncoming) ||
          (connectionFocus.outgoing && isOutgoing)
        )
      })
      .map(rel => {
        const isCrossing = isZoneCrossing(rel, entities)
        return {
          id: rel.id,
          source: rel.fromEntityId,
          target: rel.toEntityId,
          type: 'relationship',
          selected: rel.id === selectedRelationshipId,
          data: {
            ...rel,
            showLabel: rel.id === selectedRelationshipId,
            highlightZoneCrossing: filters.showZoneCrossings && isCrossing
          },
          animated: rel.type === 'integrates_with' || (filters.showZoneCrossings && isCrossing)
        }
      })
  }, [
    visibleEntities,
    relationships,
    entities,
    filters.showZoneCrossings,
    focusEntityIds,
    selectedEntityId,
    connectionFocus.incoming,
    connectionFocus.outgoing,
    selectedRelationshipId
  ])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes when filtered entities change (but preserve positions)
  useEffect(() => {
    setNodes(currentNodes => {
      // Build a map of current positions
      const currentPositions: Record<string, { x: number; y: number }> = {}
      currentNodes.forEach(node => {
        currentPositions[node.id] = node.position
      })
      
      return visibleEntities.map(entity => {
        // Use current position if node exists, otherwise use saved or default
        const position = currentPositions[entity.id] || getPosition(entity.id)
        return {
          id: entity.id,
          type: 'entity',
          position,
          data: {
            ...entity,
            expanded: expandedNodes.has(entity.id),
            selected: entity.id === selectedEntityId,
            onExpand: (id: string) => {
              setExpandedNodes(prev => {
                const next = new Set(prev)
                if (next.has(id)) {
                  next.delete(id)
                } else {
                  next.add(id)
                }
                return next
              })
            },
            onClick: (e: Entity) => onSelectEntity(e)
          }
        }
      })
    })
    setEdges(initialEdges)
  }, [visibleEntities, initialEdges, setNodes, setEdges, getPosition, expandedNodes, selectedEntityId, onSelectEntity])

  // Handle node position changes and persist through parent
  const handleNodesChange = useCallback((changes: NodeChange<Node>[]) => {
    onNodesChange(changes)
    
    // Check for position changes (drag end)
    const positionChanges = changes.filter(
      change => change.type === 'position' && change.dragging === false && change.position
    )
    
    if (positionChanges.length > 0) {
      const updates = positionChanges
        .filter(change => change.type === 'position' && change.position)
        .map(change => ({ id: change.id, position: change.position! }))
      if (updates.length > 0) {
        onEntityPositionsChange(updates)
      }
    }
  }, [onNodesChange, onEntityPositionsChange])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const entity = filteredEntities.find(e => e.id === node.id)
    if (entity) {
      onSelectEntity(entity)
    }
  }, [filteredEntities, onSelectEntity])

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    const relationship = relationships.find(rel => rel.id === edge.id) || null
    onSelectRelationship(relationship)
  }, [relationships, onSelectRelationship])

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return
    onCreateRelationship(connection.source, connection.target)
  }, [onCreateRelationship])

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (interactionMode === 'add-entity') {
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      onAddEntityAtPosition(position)
      return
    }
    onSelectEntity(null)
    onSelectRelationship(null)
  }, [interactionMode, screenToFlowPosition, onAddEntityAtPosition, onSelectEntity, onSelectRelationship])

  // Custom minimap node color based on dimension
  const nodeColor = useCallback((node: Node) => {
    const entityType = node.data?.type as EntityType
    const config = entityTypeConfig[entityType]
    
    // Color map based on dimension
    const dimensionColorMap: Record<Dimension, string> = {
      business: '#3b82f6', // blue
      ot: '#f59e0b', // amber
      it: '#0ea5e9', // sky
      data: '#06b6d4', // cyan
      infrastructure: '#64748b', // slate
      security: '#ef4444' // red
    }
    
    return config ? dimensionColorMap[config.dimension] : '#64748b'
  }, [])

  return (
    <div className="w-full h-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.05}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'relationship'
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          color="hsl(var(--muted-foreground))" 
          gap={20} 
          size={1}
          style={{ opacity: 0.3 }}
        />
        <Controls 
          className="!bg-card !border-border !rounded-lg !shadow-lg"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={nodeColor}
          maskColor="rgba(0, 0, 0, 0.8)"
          className="!bg-card !border-border !rounded-lg"
          pannable
          zoomable
        />
        
        {/* Custom arrow markers for different relationship types */}
        <svg style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            {Object.entries(relationshipTypeConfig).map(([type, config]) => (
              <marker
                key={type}
                id={`arrow-${type}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path
                  d="M 0 0 L 10 5 L 0 10 z"
                  fill={config.color}
                />
              </marker>
            ))}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 0 L 10 5 L 0 10 z"
                fill="#64748b"
              />
            </marker>
          </defs>
        </svg>

        <Panel position="top-left" className="!m-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-card/80 backdrop-blur border border-border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">
                {filteredEntities.length} entities | {edges.length} relationships
              </span>
            </div>
            {filters.showZoneCrossings && zoneCrossingCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 backdrop-blur border border-red-500/50 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-400 font-medium">
                  {zoneCrossingCount} zone crossings detected
                </span>
              </div>
            )}
          </div>
        </Panel>

        {/* Semantic zoom level indicator */}
        <Panel position="top-right" className="!m-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-card/80 backdrop-blur border border-border rounded-lg">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Abstraction</span>
            <span className="text-sm font-medium text-foreground capitalize">{filters.zoomLevel}</span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export function ArchitectureGraph(props: ArchitectureGraphProps) {
  return (
    <ReactFlowProvider>
      <ArchitectureGraphInner {...props} />
    </ReactFlowProvider>
  )
}
