'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import dagre from 'dagre'
import Papa from 'papaparse'
import { toPng } from 'html-to-image'
import { ArchitectureGraph } from '@/components/graph/architecture-graph'
import { ControlPanel } from '@/components/panels/control-panel'
import { EntityDetailPanel } from '@/components/panels/entity-detail-panel'
import { RelationshipDetailPanel } from '@/components/panels/relationship-detail-panel'
import { DataManagerPanel } from '@/components/panels/data-manager-panel'
import type { Entity, FilterState, Relationship } from '@/lib/types'
import { mockEntities, mockRelationships } from '@/lib/mock-data'
import { AUTH_MODE, DATA_SOURCE, ENABLE_SAMPLE_DATA, IS_AUTH_ENABLED, IS_AUTH_REQUIRED } from '@/lib/config'
import { loadLocalData, saveLocalData } from '@/lib/data/local-storage'
import { createId } from '@/lib/data/utils'
import {
  fetchEntities,
  fetchRelationships,
  upsertEntity,
  upsertEntities,
  deleteEntity as deleteEntityDb,
  upsertRelationship,
  upsertRelationships,
  deleteRelationship as deleteRelationshipDb,
  clearEntities,
  clearRelationships
} from '@/lib/data/supabase'
import { getSession, onAuthStateChange, signInWithGoogle, signOut } from '@/lib/supabase/auth'
import { isSupabaseConfigured } from '@/lib/supabase/client'

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function parseJsonField<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

async function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>({
    dimensions: [],
    entityTypes: [],
    statuses: [],
    searchQuery: '',
    showZoneCrossings: false,
    zoomLevel: 'low'
  })

  const [entities, setEntities] = useState<Entity[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(!IS_AUTH_ENABLED)

  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null)
  const [connectionFocus, setConnectionFocus] = useState({
    incoming: false,
    outgoing: false
  })

  const [interactionMode, setInteractionMode] = useState<'select' | 'add-entity'>('select')
  const [managerOpen, setManagerOpen] = useState(false)

  const canEdit = useMemo(() => {
    if (IS_AUTH_REQUIRED) {
      return Boolean(session)
    }
    return true
  }, [session])

  useEffect(() => {
    if (!IS_AUTH_ENABLED) return
    let active = true
    getSession().then(current => {
      if (!active) return
      setSession(current)
      setAuthReady(true)
    })
    const subscription = onAuthStateChange(next => {
      if (!active) return
      setSession(next)
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!authReady) return

    let active = true

    const loadLocal = () => {
      const local = loadLocalData()
      if (local) {
        return { entities: local.entities, relationships: local.relationships }
      }
      if (ENABLE_SAMPLE_DATA) {
        return { entities: mockEntities, relationships: mockRelationships }
      }
      return { entities: [], relationships: [] }
    }

    const loadData = async () => {
      setLoading(true)
      setDataError(null)
      try {
        if (DATA_SOURCE === 'supabase') {
          if (!isSupabaseConfigured) {
            setDataError('Supabase is not configured. Falling back to local data.')
            const fallback = loadLocal()
            if (active) {
              setEntities(fallback.entities)
              setRelationships(fallback.relationships)
            }
            return
          }
          if (IS_AUTH_REQUIRED && !session) {
            if (active) {
              setEntities([])
              setRelationships([])
            }
            return
          }
          const [nextEntities, nextRelationships] = await Promise.all([
            fetchEntities(),
            fetchRelationships()
          ])

          let resolvedEntities = nextEntities
          let resolvedRelationships = nextRelationships

          if (ENABLE_SAMPLE_DATA && nextEntities.length === 0 && nextRelationships.length === 0) {
            resolvedEntities = mockEntities
            resolvedRelationships = mockRelationships
            try {
              await upsertEntities(resolvedEntities)
              await upsertRelationships(resolvedRelationships)
            } catch {
              // ignore seed failures
            }
          }

          if (active) {
            setEntities(resolvedEntities)
            setRelationships(resolvedRelationships)
          }
        } else {
          const fallback = loadLocal()
          if (active) {
            setEntities(fallback.entities)
            setRelationships(fallback.relationships)
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load data'
        setDataError(message)
        const fallback = loadLocal()
        if (active) {
          setEntities(fallback.entities)
          setRelationships(fallback.relationships)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [authReady, session])

  useEffect(() => {
    if (DATA_SOURCE !== 'local') return
    if (!loading) {
      saveLocalData(entities, relationships)
    }
  }, [entities, relationships, loading])

  useEffect(() => {
    if (!selectedEntity) return
    const updated = entities.find(entity => entity.id === selectedEntity.id) || null
    if (updated !== selectedEntity) {
      setSelectedEntity(updated)
    }
  }, [entities, selectedEntity])

  useEffect(() => {
    if (!selectedRelationship) return
    const updated = relationships.find(rel => rel.id === selectedRelationship.id) || null
    if (updated !== selectedRelationship) {
      setSelectedRelationship(updated)
    }
  }, [relationships, selectedRelationship])

  const handleSelectEntity = useCallback((entity: Entity | null) => {
    setSelectedRelationship(null)
    setSelectedEntity(entity)
    if (!entity) {
      setConnectionFocus({ incoming: false, outgoing: false })
    }
  }, [])

  const handleSelectRelationship = useCallback((relationship: Relationship | null) => {
    setSelectedEntity(null)
    setSelectedRelationship(relationship)
    setConnectionFocus({ incoming: false, outgoing: false })
  }, [])

  const handleNavigateToEntity = useCallback((entityId: string) => {
    const entity = entities.find(e => e.id === entityId)
    if (entity) {
      setSelectedRelationship(null)
      setSelectedEntity(entity)
    }
  }, [entities])

  const handleSignIn = useCallback(() => {
    if (!isSupabaseConfigured) {
      setDataError('Supabase is not configured')
      return
    }
    signInWithGoogle().catch(() => {
      setDataError('Failed to start Google sign-in')
    })
  }, [])

  const handleSignOut = useCallback(() => {
    signOut().catch(() => {
      setDataError('Failed to sign out')
    })
  }, [])

  const handleCreateEntity = useCallback((entity: Entity) => {
    setEntities(prev => [...prev, entity])
    if (DATA_SOURCE === 'supabase' && isSupabaseConfigured) {
      upsertEntity(entity).catch(() => {
        setDataError('Failed to save entity to Supabase')
      })
    }
  }, [])

  const handleAddEntityAtPosition = useCallback((position: { x: number; y: number }) => {
    if (!canEdit) return
    const newEntity: Entity = {
      id: createId('ent'),
      type: 'application',
      name: 'New Entity',
      description: '',
      status: 'as-is',
      owner: '',
      criticality: 'medium',
      tags: [],
      metadata: {},
      position
    }
    handleCreateEntity(newEntity)
    setSelectedEntity(newEntity)
    setInteractionMode('select')
  }, [canEdit, handleCreateEntity])

  const handleCreateRelationshipRecord = useCallback((relationship: Relationship) => {
    setRelationships(prev => [...prev, relationship])
    if (DATA_SOURCE === 'supabase' && isSupabaseConfigured) {
      upsertRelationship(relationship).catch(() => {
        setDataError('Failed to save relationship to Supabase')
      })
    }
    setSelectedRelationship(relationship)
  }, [])

  const handleCreateRelationship = useCallback((sourceId: string, targetId: string) => {
    if (!canEdit) return
    const relationship: Relationship = {
      id: createId('rel'),
      fromEntityId: sourceId,
      toEntityId: targetId,
      type: 'depends_on',
      bidirectional: false,
      strength: 'normal'
    }
    handleCreateRelationshipRecord(relationship)
  }, [canEdit, handleCreateRelationshipRecord])

  const handleUpdateEntity = useCallback((updated: Entity) => {
    setEntities(prev => prev.map(entity => (entity.id === updated.id ? updated : entity)))
    if (DATA_SOURCE === 'supabase' && isSupabaseConfigured) {
      upsertEntity(updated).catch(() => {
        setDataError('Failed to save entity changes to Supabase')
      })
    }
  }, [])

  const handleDeleteEntity = useCallback((entityId: string) => {
    setEntities(prev => prev.filter(entity => entity.id !== entityId))
    setRelationships(prev => prev.filter(rel => rel.fromEntityId !== entityId && rel.toEntityId !== entityId))
    setSelectedEntity(null)
    setSelectedRelationship(null)
    if (DATA_SOURCE === 'supabase' && isSupabaseConfigured) {
      deleteEntityDb(entityId).catch(() => {
        setDataError('Failed to delete entity from Supabase')
      })
    }
  }, [])

  const handleUpdateRelationship = useCallback((updated: Relationship) => {
    setRelationships(prev => prev.map(rel => (rel.id === updated.id ? updated : rel)))
    if (DATA_SOURCE === 'supabase' && isSupabaseConfigured) {
      upsertRelationship(updated).catch(() => {
        setDataError('Failed to save relationship changes to Supabase')
      })
    }
  }, [])

  const handleDeleteRelationship = useCallback((relationshipId: string) => {
    setRelationships(prev => prev.filter(rel => rel.id !== relationshipId))
    setSelectedRelationship(null)
    if (DATA_SOURCE === 'supabase' && isSupabaseConfigured) {
      deleteRelationshipDb(relationshipId).catch(() => {
        setDataError('Failed to delete relationship from Supabase')
      })
    }
  }, [])

  const handleEntityPositionsChange = useCallback(
    (updates: Array<{ id: string; position: { x: number; y: number } }>) => {
      if (updates.length === 0) return
      const positionMap = new Map(updates.map(update => [update.id, update.position]))
      setEntities(prev =>
        prev.map(entity =>
          positionMap.has(entity.id)
            ? { ...entity, position: positionMap.get(entity.id) }
            : entity
        )
      )

      if (DATA_SOURCE === 'supabase' && isSupabaseConfigured) {
        const changed = entities
          .filter(entity => positionMap.has(entity.id))
          .map(entity => ({ ...entity, position: positionMap.get(entity.id) }))
        if (changed.length > 0) {
          upsertEntities(changed).catch(() => {
            setDataError('Failed to save positions to Supabase')
          })
        }
      }
    },
    [entities]
  )

  const handleAutoLayout = useCallback(() => {
    if (!canEdit) return
    const graph = new dagre.graphlib.Graph()
    graph.setDefaultEdgeLabel(() => ({}))
    graph.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 120 })

    entities.forEach(entity => {
      graph.setNode(entity.id, { width: 180, height: 80 })
    })
    relationships.forEach(rel => {
      graph.setEdge(rel.fromEntityId, rel.toEntityId)
    })

    dagre.layout(graph)

    const nextEntities = entities.map(entity => {
      const node = graph.node(entity.id)
      if (!node) return entity
      return {
        ...entity,
        position: { x: node.x - 90, y: node.y - 40 }
      }
    })

    setEntities(nextEntities)

    if (DATA_SOURCE === 'supabase' && isSupabaseConfigured) {
      upsertEntities(nextEntities).catch(() => {
        setDataError('Failed to save layout to Supabase')
      })
    }
  }, [entities, relationships, canEdit])

  const handleExportJson = useCallback(() => {
    const payload = JSON.stringify({ entities, relationships }, null, 2)
    downloadFile(payload, 'archmod-data.json', 'application/json')
  }, [entities, relationships])

  const handleExportEntitiesCsv = useCallback(() => {
    const rows = entities.map(entity => ({
      id: entity.id,
      type: entity.type,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      owner: entity.owner,
      criticality: entity.criticality,
      tags: JSON.stringify(entity.tags ?? []),
      metadata: JSON.stringify(entity.metadata ?? {}),
      children: JSON.stringify(entity.children ?? []),
      zone_id: entity.zoneId ?? '',
      position: JSON.stringify(entity.position ?? null)
    }))
    const csv = Papa.unparse(rows)
    downloadFile(csv, 'entities.csv', 'text/csv')
  }, [entities])

  const handleExportRelationshipsCsv = useCallback(() => {
    const rows = relationships.map(rel => ({
      id: rel.id,
      from_entity_id: rel.fromEntityId,
      to_entity_id: rel.toEntityId,
      type: rel.type,
      bidirectional: rel.bidirectional,
      strength: rel.strength,
      notes: rel.notes ?? '',
      crosses_zone: rel.crossesZone ?? '',
      from_zone: rel.fromZone ?? '',
      to_zone: rel.toZone ?? ''
    }))
    const csv = Papa.unparse(rows)
    downloadFile(csv, 'relationships.csv', 'text/csv')
  }, [relationships])

  const applyImportedData = useCallback(
    async (nextEntities: Entity[], nextRelationships: Relationship[]) => {
      setEntities(nextEntities)
      setRelationships(nextRelationships)
      setSelectedEntity(null)
      setSelectedRelationship(null)

      if (DATA_SOURCE === 'supabase' && isSupabaseConfigured) {
        try {
          await clearRelationships()
          await clearEntities()
          await upsertEntities(nextEntities)
          await upsertRelationships(nextRelationships)
        } catch {
          setDataError('Failed to import data into Supabase')
        }
      }
    },
    []
  )

  const handleImportJson = useCallback(
    async (file: File) => {
      try {
        const text = await readFile(file)
        const parsed = JSON.parse(text) as { entities?: Entity[]; relationships?: Relationship[] }
        const nextEntities = Array.isArray(parsed.entities) ? parsed.entities : []
        const nextRelationships = Array.isArray(parsed.relationships) ? parsed.relationships : []
        await applyImportedData(nextEntities, nextRelationships)
      } catch {
        setDataError('Invalid JSON import')
      }
    },
    [applyImportedData]
  )

  const handleImportEntitiesCsv = useCallback(
    async (file: File) => {
      try {
        const text = await readFile(file)
        const result = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true
        })
        if (result.errors.length > 0) {
          setDataError('Failed to parse entities CSV')
          return
        }
        const nextEntities = result.data.map(row => ({
          id: row.id || createId('ent'),
          type: (row.type || 'application') as Entity['type'],
          name: row.name || 'Untitled',
          description: row.description || '',
          status: (row.status || 'as-is') as Entity['status'],
          owner: row.owner || '',
          criticality: (row.criticality || 'medium') as Entity['criticality'],
          tags: parseJsonField<string[]>(row.tags, []),
          metadata: parseJsonField<Record<string, unknown>>(row.metadata, {}),
          children: parseJsonField<string[]>(row.children, []),
          zoneId: row.zone_id || undefined,
          position: parseJsonField<{ x: number; y: number } | null>(row.position, null) ?? undefined
        }))
        await applyImportedData(nextEntities, [])
      } catch {
        setDataError('Failed to import entities CSV')
      }
    },
    [applyImportedData]
  )

  const handleImportRelationshipsCsv = useCallback(
    async (file: File) => {
      try {
        const text = await readFile(file)
        const result = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true
        })
        if (result.errors.length > 0) {
          setDataError('Failed to parse relationships CSV')
          return
        }
        const nextRelationships = result.data.map(row => ({
          id: row.id || createId('rel'),
          fromEntityId: row.from_entity_id || row.fromEntityId || '',
          toEntityId: row.to_entity_id || row.toEntityId || '',
          type: (row.type || 'depends_on') as Relationship['type'],
          bidirectional: row.bidirectional === 'true' || row.bidirectional === '1',
          strength: (row.strength || 'normal') as Relationship['strength'],
          notes: row.notes || undefined,
          crossesZone: row.crosses_zone === 'true' || row.crosses_zone === '1',
          fromZone: row.from_zone || undefined,
          toZone: row.to_zone || undefined
        }))
        await applyImportedData(entities, nextRelationships)
      } catch {
        setDataError('Failed to import relationships CSV')
      }
    },
    [applyImportedData, entities]
  )

  const handleExportPng = useCallback(async () => {
    const element = document.querySelector('.react-flow') as HTMLElement | null
    if (!element) return
    try {
      const dataUrl = await toPng(element, { cacheBust: true })
      const link = document.createElement('a')
      link.download = 'archmod-diagram.png'
      link.href = dataUrl
      link.click()
    } catch {
      setDataError('Failed to export PNG')
    }
  }, [])

  const showAuthGate = IS_AUTH_REQUIRED && IS_AUTH_ENABLED && !session

  return (
    <div className="h-screen flex bg-background">
      {/* Left Control Panel */}
      <ControlPanel
        filters={filters}
        onFiltersChange={setFilters}
        interactionMode={interactionMode}
        onInteractionModeChange={setInteractionMode}
        onOpenManager={() => setManagerOpen(true)}
        authMode={AUTH_MODE}
        userEmail={session?.user?.email ?? null}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Main Graph Canvas */}
      <main className="flex-1 relative">
        <ArchitectureGraph
          filters={filters}
          entities={entities}
          relationships={relationships}
          onSelectEntity={handleSelectEntity}
          onSelectRelationship={handleSelectRelationship}
          selectedEntityId={selectedEntity?.id || null}
          selectedRelationshipId={selectedRelationship?.id || null}
          connectionFocus={connectionFocus}
          interactionMode={interactionMode}
          onAddEntityAtPosition={handleAddEntityAtPosition}
          onCreateRelationship={handleCreateRelationship}
          onEntityPositionsChange={handleEntityPositionsChange}
        />

        {/* Title Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <h1 className="text-lg font-semibold text-foreground/80 bg-background/60 backdrop-blur px-4 py-2 rounded-lg border border-border">
            Industrial EA Modeler
          </h1>
        </div>

        {loading && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-card/80 border border-border rounded-lg px-3 py-1 text-xs text-muted-foreground">
            Loading data...
          </div>
        )}

        {dataError && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500/40 rounded-lg px-3 py-1 text-xs text-red-300">
            {dataError}
          </div>
        )}

        {showAuthGate && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="max-w-sm text-center space-y-3 bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground">Sign in required</h2>
              <p className="text-sm text-muted-foreground">
                Authentication is required in {AUTH_MODE} mode. Use the account button to sign in.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Right Detail Panel */}
      {selectedEntity && (
        <EntityDetailPanel
          entity={selectedEntity}
          entities={entities}
          relationships={relationships}
          onClose={() => handleSelectEntity(null)}
          onNavigate={handleNavigateToEntity}
          onUpdateEntity={handleUpdateEntity}
          onDeleteEntity={handleDeleteEntity}
          canEdit={canEdit}
          connectionFocus={connectionFocus}
          onConnectionFocusChange={setConnectionFocus}
        />
      )}
      {selectedRelationship && (
        <RelationshipDetailPanel
          relationship={selectedRelationship}
          entities={entities}
          onClose={() => setSelectedRelationship(null)}
          onNavigate={handleNavigateToEntity}
          onUpdateRelationship={handleUpdateRelationship}
          onDeleteRelationship={handleDeleteRelationship}
          canEdit={canEdit}
        />
      )}

      <DataManagerPanel
        open={managerOpen}
        onClose={() => setManagerOpen(false)}
        entities={entities}
        relationships={relationships}
        onCreateEntity={handleCreateEntity}
        onUpdateEntity={handleUpdateEntity}
        onDeleteEntity={handleDeleteEntity}
        onCreateRelationship={handleCreateRelationshipRecord}
        onUpdateRelationship={handleUpdateRelationship}
        onDeleteRelationship={handleDeleteRelationship}
        onExportJson={handleExportJson}
        onExportEntitiesCsv={handleExportEntitiesCsv}
        onExportRelationshipsCsv={handleExportRelationshipsCsv}
        onImportJson={handleImportJson}
        onImportEntitiesCsv={handleImportEntitiesCsv}
        onImportRelationshipsCsv={handleImportRelationshipsCsv}
        onExportPng={handleExportPng}
        onAutoLayout={handleAutoLayout}
        canEdit={canEdit}
      />
    </div>
  )
}
