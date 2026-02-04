'use client'

import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Entity, Relationship } from '@/lib/types'
import { entityTypeConfig, relationshipTypeConfig, statusConfig } from '@/lib/types'
import { createId, parseCommaList } from '@/lib/data/utils'

interface DataManagerPanelProps {
  open: boolean
  entities: Entity[]
  relationships: Relationship[]
  onClose: () => void
  onCreateEntity: (entity: Entity) => void
  onUpdateEntity: (entity: Entity) => void
  onDeleteEntity: (entityId: string) => void
  onCreateRelationship: (relationship: Relationship) => void
  onUpdateRelationship: (relationship: Relationship) => void
  onDeleteRelationship: (relationshipId: string) => void
  onExportJson: () => void
  onExportEntitiesCsv: () => void
  onExportRelationshipsCsv: () => void
  onImportJson: (file: File) => void
  onImportEntitiesCsv: (file: File) => void
  onImportRelationshipsCsv: (file: File) => void
  onExportPng: () => void
  onAutoLayout: () => void
  canEdit: boolean
}

export function DataManagerPanel({
  open,
  entities,
  relationships,
  onClose,
  onCreateEntity,
  onUpdateEntity,
  onDeleteEntity,
  onCreateRelationship,
  onUpdateRelationship,
  onDeleteRelationship,
  onExportJson,
  onExportEntitiesCsv,
  onExportRelationshipsCsv,
  onImportJson,
  onImportEntitiesCsv,
  onImportRelationshipsCsv,
  onExportPng,
  onAutoLayout,
  canEdit
}: DataManagerPanelProps) {
  const [tab, setTab] = useState<'entities' | 'relationships' | 'import'>('entities')
  const [entitySearch, setEntitySearch] = useState('')
  const [relationshipSearch, setRelationshipSearch] = useState('')

  const [entityDraft, setEntityDraft] = useState<Entity | null>(null)
  const [entityDraftMode, setEntityDraftMode] = useState<'new' | 'edit' | null>(null)
  const [entityTagsInput, setEntityTagsInput] = useState('')
  const [entityChildrenInput, setEntityChildrenInput] = useState('')
  const [entityMetadataInput, setEntityMetadataInput] = useState('')
  const [entityMetadataError, setEntityMetadataError] = useState<string | null>(null)

  const [relationshipDraft, setRelationshipDraft] = useState<Relationship | null>(null)
  const [relationshipDraftMode, setRelationshipDraftMode] = useState<'new' | 'edit' | null>(null)
  const [relationshipNotesInput, setRelationshipNotesInput] = useState('')

  useEffect(() => {
    if (!open) {
      setEntityDraft(null)
      setEntityDraftMode(null)
      setRelationshipDraft(null)
      setRelationshipDraftMode(null)
    }
  }, [open])

  const filteredEntities = useMemo(() => {
    if (!entitySearch.trim()) return entities
    const query = entitySearch.toLowerCase()
    return entities.filter(entity =>
      entity.name.toLowerCase().includes(query) ||
      entity.type.toLowerCase().includes(query) ||
      entity.status.toLowerCase().includes(query)
    )
  }, [entities, entitySearch])

  const filteredRelationships = useMemo(() => {
    if (!relationshipSearch.trim()) return relationships
    const query = relationshipSearch.toLowerCase()
    return relationships.filter(rel =>
      rel.type.toLowerCase().includes(query) ||
      rel.fromEntityId.toLowerCase().includes(query) ||
      rel.toEntityId.toLowerCase().includes(query)
    )
  }, [relationships, relationshipSearch])

  const zoneOptions = useMemo(() => entities.filter(entity => entity.type === 'zone'), [entities])

  const startNewEntity = () => {
    if (!canEdit) return
    const draft: Entity = {
      id: createId('ent'),
      type: 'application',
      name: '',
      description: '',
      status: 'as-is',
      owner: '',
      criticality: 'medium',
      tags: [],
      metadata: {}
    }
    setEntityDraft(draft)
    setEntityDraftMode('new')
    setEntityTagsInput('')
    setEntityChildrenInput('')
    setEntityMetadataInput('{}')
    setEntityMetadataError(null)
  }

  const startEditEntity = (entity: Entity) => {
    if (!canEdit) return
    setEntityDraft(entity)
    setEntityDraftMode('edit')
    setEntityTagsInput(entity.tags.join(', '))
    setEntityChildrenInput(entity.children?.join(', ') ?? '')
    setEntityMetadataInput(JSON.stringify(entity.metadata ?? {}, null, 2))
    setEntityMetadataError(null)
  }

  const saveEntity = () => {
    if (!entityDraft || !entityDraftMode) return
    let parsedMetadata: Record<string, unknown> = {}
    if (entityMetadataInput.trim().length > 0) {
      try {
        parsedMetadata = JSON.parse(entityMetadataInput) as Record<string, unknown>
      } catch {
        setEntityMetadataError('Invalid JSON')
        return
      }
    }
    setEntityMetadataError(null)
    const next: Entity = {
      ...entityDraft,
      tags: parseCommaList(entityTagsInput),
      children: parseCommaList(entityChildrenInput),
      metadata: parsedMetadata
    }
    if (next.children.length === 0) delete next.children

    if (entityDraftMode === 'new') {
      onCreateEntity(next)
    } else {
      onUpdateEntity(next)
    }
    setEntityDraftMode(null)
    setEntityDraft(null)
  }

  const startNewRelationship = () => {
    if (!canEdit) return
    const firstEntity = entities[0]
    if (!firstEntity) return
    const draft: Relationship = {
      id: createId('rel'),
      fromEntityId: firstEntity.id,
      toEntityId: firstEntity.id,
      type: 'depends_on',
      bidirectional: false,
      strength: 'normal'
    }
    setRelationshipDraft(draft)
    setRelationshipDraftMode('new')
    setRelationshipNotesInput('')
  }

  const startEditRelationship = (relationship: Relationship) => {
    if (!canEdit) return
    setRelationshipDraft(relationship)
    setRelationshipDraftMode('edit')
    setRelationshipNotesInput(relationship.notes ?? '')
  }

  const saveRelationship = () => {
    if (!relationshipDraft || !relationshipDraftMode) return
    const next: Relationship = {
      ...relationshipDraft,
      notes: relationshipNotesInput.trim() ? relationshipNotesInput : undefined
    }
    if (relationshipDraftMode === 'new') {
      onCreateRelationship(next)
    } else {
      onUpdateRelationship(next)
    }
    setRelationshipDraftMode(null)
    setRelationshipDraft(null)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="w-[min(1100px,95vw)] h-[min(85vh,900px)] bg-card border border-border rounded-xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Data Manager</h2>
            <p className="text-xs text-muted-foreground">Edit entities and relationships in classic list form.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
          <Button variant={tab === 'entities' ? 'default' : 'outline'} size="sm" onClick={() => setTab('entities')}>
            Entities
          </Button>
          <Button variant={tab === 'relationships' ? 'default' : 'outline'} size="sm" onClick={() => setTab('relationships')}>
            Relationships
          </Button>
          <Button variant={tab === 'import' ? 'default' : 'outline'} size="sm" onClick={() => setTab('import')}>
            Import / Export
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onAutoLayout} disabled={!canEdit}>
              Auto Layout
            </Button>
            <Button variant="outline" size="sm" onClick={onExportPng}>
              Export PNG
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {tab === 'entities' && (
            <div className="flex h-full">
              <div className="w-1/2 border-r border-border flex flex-col">
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search entities..."
                      value={entitySearch}
                      onChange={(e) => setEntitySearch(e.target.value)}
                    />
                    <Button size="sm" variant="outline" onClick={startNewEntity} disabled={!canEdit}>
                      New
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredEntities.length} entities
                  </p>
                </div>
                <Separator />
                <ScrollArea className="flex-1 p-4 space-y-2">
                  {filteredEntities.map(entity => (
                    <div key={entity.id} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
                      <div className={cn('w-2.5 h-2.5 rounded-full', entityTypeConfig[entity.type].color.replace('text-', 'bg-'))} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground truncate">{entity.name}</p>
                        <p className="text-xs text-muted-foreground">{entityTypeConfig[entity.type].label}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {statusConfig[entity.status].label}
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={() => startEditEntity(entity)} disabled={!canEdit}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDeleteEntity(entity.id)} disabled={!canEdit}>
                        Delete
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </div>

              <div className="w-1/2 p-4 overflow-auto">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {entityDraftMode ? (entityDraftMode === 'new' ? 'New Entity' : 'Edit Entity') : 'Select an entity'}
                </h3>
                {!entityDraft && (
                  <p className="text-sm text-muted-foreground">Choose an entity from the list or create a new one.</p>
                )}
                {entityDraft && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <Input
                        value={entityDraft.name}
                        onChange={(e) => setEntityDraft({ ...entityDraft, name: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Type</Label>
                        <select
                          value={entityDraft.type}
                          onChange={(e) => setEntityDraft({ ...entityDraft, type: e.target.value as Entity['type'] })}
                          className="mt-1 h-9 w-full rounded-md border border-border bg-muted/50 px-2 text-sm text-foreground"
                        >
                          {Object.entries(entityTypeConfig).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <select
                          value={entityDraft.status}
                          onChange={(e) => setEntityDraft({ ...entityDraft, status: e.target.value as Entity['status'] })}
                          className="mt-1 h-9 w-full rounded-md border border-border bg-muted/50 px-2 text-sm text-foreground"
                        >
                          {Object.entries(statusConfig).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Owner</Label>
                        <Input
                          value={entityDraft.owner}
                          onChange={(e) => setEntityDraft({ ...entityDraft, owner: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Criticality</Label>
                        <select
                          value={entityDraft.criticality}
                          onChange={(e) => setEntityDraft({ ...entityDraft, criticality: e.target.value as Entity['criticality'] })}
                          className="mt-1 h-9 w-full rounded-md border border-border bg-muted/50 px-2 text-sm text-foreground"
                        >
                          {(['low', 'medium', 'high', 'critical'] as const).map(level => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Zone</Label>
                      <select
                        value={entityDraft.zoneId ?? ''}
                        onChange={(e) => setEntityDraft({ ...entityDraft, zoneId: e.target.value || undefined })}
                        className="mt-1 h-9 w-full rounded-md border border-border bg-muted/50 px-2 text-sm text-foreground"
                      >
                        <option value="">None</option>
                        {zoneOptions.map(zone => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <textarea
                        value={entityDraft.description}
                        onChange={(e) => setEntityDraft({ ...entityDraft, description: e.target.value })}
                        className="mt-1 min-h-[80px] w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Tags (comma separated)</Label>
                      <Input
                        value={entityTagsInput}
                        onChange={(e) => setEntityTagsInput(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Children IDs (comma separated)</Label>
                      <Input
                        value={entityChildrenInput}
                        onChange={(e) => setEntityChildrenInput(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Metadata (JSON)</Label>
                      <textarea
                        value={entityMetadataInput}
                        onChange={(e) => setEntityMetadataInput(e.target.value)}
                        className="mt-1 min-h-[120px] w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
                      />
                      {entityMetadataError && (
                        <p className="mt-1 text-xs text-red-400">{entityMetadataError}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button onClick={saveEntity} disabled={!canEdit}>
                        {entityDraftMode === 'new' ? 'Create' : 'Save'}
                      </Button>
                      <Button variant="ghost" onClick={() => setEntityDraft(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'relationships' && (
            <div className="flex h-full">
              <div className="w-1/2 border-r border-border flex flex-col">
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search relationships..."
                      value={relationshipSearch}
                      onChange={(e) => setRelationshipSearch(e.target.value)}
                    />
                    <Button size="sm" variant="outline" onClick={startNewRelationship} disabled={!canEdit}>
                      New
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredRelationships.length} relationships
                  </p>
                </div>
                <Separator />
                <ScrollArea className="flex-1 p-4 space-y-2">
                  {filteredRelationships.map(rel => (
                    <div key={rel.id} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: relationshipTypeConfig[rel.type].color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground truncate">{relationshipTypeConfig[rel.type].label}</p>
                        <p className="text-xs text-muted-foreground truncate">{rel.fromEntityId} → {rel.toEntityId}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => startEditRelationship(rel)} disabled={!canEdit}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDeleteRelationship(rel.id)} disabled={!canEdit}>
                        Delete
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </div>

              <div className="w-1/2 p-4 overflow-auto">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {relationshipDraftMode ? (relationshipDraftMode === 'new' ? 'New Relationship' : 'Edit Relationship') : 'Select a relationship'}
                </h3>
                {!relationshipDraft && (
                  <p className="text-sm text-muted-foreground">Choose a relationship from the list or create a new one.</p>
                )}
                {relationshipDraft && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">From</Label>
                      <select
                        value={relationshipDraft.fromEntityId}
                        onChange={(e) => setRelationshipDraft({ ...relationshipDraft, fromEntityId: e.target.value })}
                        className="mt-1 h-9 w-full rounded-md border border-border bg-muted/50 px-2 text-sm text-foreground"
                      >
                        {entities.map(entity => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">To</Label>
                      <select
                        value={relationshipDraft.toEntityId}
                        onChange={(e) => setRelationshipDraft({ ...relationshipDraft, toEntityId: e.target.value })}
                        className="mt-1 h-9 w-full rounded-md border border-border bg-muted/50 px-2 text-sm text-foreground"
                      >
                        {entities.map(entity => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Type</Label>
                        <select
                          value={relationshipDraft.type}
                          onChange={(e) => setRelationshipDraft({ ...relationshipDraft, type: e.target.value as Relationship['type'] })}
                          className="mt-1 h-9 w-full rounded-md border border-border bg-muted/50 px-2 text-sm text-foreground"
                        >
                          {Object.entries(relationshipTypeConfig).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Strength</Label>
                        <select
                          value={relationshipDraft.strength}
                          onChange={(e) => setRelationshipDraft({ ...relationshipDraft, strength: e.target.value as Relationship['strength'] })}
                          className="mt-1 h-9 w-full rounded-md border border-border bg-muted/50 px-2 text-sm text-foreground"
                        >
                          {(['weak', 'normal', 'strong'] as const).map(level => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={relationshipDraft.bidirectional}
                        onChange={(e) => setRelationshipDraft({ ...relationshipDraft, bidirectional: e.target.checked })}
                      />
                      Bidirectional
                    </label>

                    <div>
                      <Label className="text-xs text-muted-foreground">Notes</Label>
                      <textarea
                        value={relationshipNotesInput}
                        onChange={(e) => setRelationshipNotesInput(e.target.value)}
                        className="mt-1 min-h-[120px] w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button onClick={saveRelationship} disabled={!canEdit}>
                        {relationshipDraftMode === 'new' ? 'Create' : 'Save'}
                      </Button>
                      <Button variant="ghost" onClick={() => setRelationshipDraft(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'import' && (
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Export</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={onExportJson}>
                    Export JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={onExportEntitiesCsv}>
                    Export Entities CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={onExportRelationshipsCsv}>
                    Export Relationships CSV
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Import (replaces current data)</h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">JSON file</Label>
                    <input
                      type="file"
                      accept="application/json"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) onImportJson(file)
                      }}
                      className="mt-1 text-xs text-muted-foreground"
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Entities CSV</Label>
                    <input
                      type="file"
                      accept="text/csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) onImportEntitiesCsv(file)
                      }}
                      className="mt-1 text-xs text-muted-foreground"
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Relationships CSV</Label>
                    <input
                      type="file"
                      accept="text/csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) onImportRelationshipsCsv(file)
                      }}
                      className="mt-1 text-xs text-muted-foreground"
                      disabled={!canEdit}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Import will overwrite the current dataset. Use export first if you need a backup.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
