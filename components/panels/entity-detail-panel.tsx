'use client'

import React from "react"
import { useEffect, useState } from 'react'

import { 
  X, 
  Target, 
  Workflow, 
  AppWindow, 
  Server, 
  Database, 
  Link,
  User,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Tag,
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
  Shield,
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { 
  Entity, 
  Relationship,
  ZoneType 
} from '@/lib/types'
import { 
  entityTypeConfig, 
  statusConfig, 
  relationshipTypeConfig,
  zoneTypeConfig
} from '@/lib/types'
import { isZoneCrossing } from '@/lib/mock-data'
import { parseCommaList } from '@/lib/data/utils'

const iconMap: Record<string, React.ElementType> = {
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

interface EntityDetailPanelProps {
  entity: Entity | null
  entities: Entity[]
  relationships: Relationship[]
  onClose: () => void
  onNavigate: (entityId: string) => void
  onUpdateEntity: (entity: Entity) => void
  onDeleteEntity: (entityId: string) => void
  canEdit: boolean
  connectionFocus: { incoming: boolean; outgoing: boolean }
  onConnectionFocusChange: (focus: { incoming: boolean; outgoing: boolean }) => void
}

export function EntityDetailPanel({ 
  entity, 
  entities,
  relationships,
  onClose, 
  onNavigate,
  onUpdateEntity,
  onDeleteEntity,
  canEdit,
  connectionFocus,
  onConnectionFocusChange
}: EntityDetailPanelProps) {
  if (!entity) return null

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<Entity>(entity)
  const [tagsInput, setTagsInput] = useState('')
  const [childrenInput, setChildrenInput] = useState('')
  const [metadataInput, setMetadataInput] = useState('')
  const [metadataError, setMetadataError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(entity)
    setTagsInput(entity.tags.join(', '))
    setChildrenInput(entity.children?.join(', ') ?? '')
    setMetadataInput(JSON.stringify(entity.metadata ?? {}, null, 2))
    setMetadataError(null)
    setIsEditing(false)
  }, [entity])

  const config = entityTypeConfig[entity.type]
  const status = statusConfig[entity.status]
  const Icon = iconMap[config.icon] || Target

  // Get relationships for this entity
  const incomingRelations = relationships.filter(r => r.toEntityId === entity.id)
  const outgoingRelations = relationships.filter(r => r.fromEntityId === entity.id)

  // Count zone crossings
  const zoneCrossingCount = [...incomingRelations, ...outgoingRelations].filter(
    rel => isZoneCrossing(rel, entities)
  ).length

  const getEntityById = (id: string) => entities.find(e => e.id === id)
  
  // Get zone info
  const zoneEntity = entity.zoneId ? getEntityById(entity.zoneId) : null
  const zoneConfig = zoneEntity?.type === 'zone' && (zoneEntity as Entity & { zoneType?: ZoneType }).zoneType 
    ? zoneTypeConfig[(zoneEntity as Entity & { zoneType?: ZoneType }).zoneType!] 
    : null

  const criticalityColors = {
    low: 'bg-slate-500/20 text-slate-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-orange-500/20 text-orange-400',
    critical: 'bg-red-500/20 text-red-400'
  }

  const zoneOptions = entities.filter(e => e.type === 'zone')

  const updateDraft = (partial: Partial<Entity>) => {
    setDraft(prev => ({ ...prev, ...partial }))
  }

  const handleSave = () => {
    let parsedMetadata: Record<string, unknown> = {}
    if (metadataInput.trim().length > 0) {
      try {
        parsedMetadata = JSON.parse(metadataInput) as Record<string, unknown>
      } catch {
        setMetadataError('Invalid JSON')
        return
      }
    }
    setMetadataError(null)
    const next: Entity = {
      ...draft,
      tags: parseCommaList(tagsInput),
      children: parseCommaList(childrenInput),
      metadata: parsedMetadata
    }
    if (next.children.length === 0) {
      delete next.children
    }
    onUpdateEntity(next)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (!canEdit) return
    if (window.confirm(`Delete ${entity.name}? This will remove its relationships too.`)) {
      onDeleteEntity(entity.id)
    }
  }

  const focusActive = connectionFocus.incoming || connectionFocus.outgoing

  const toggleIncoming = () => {
    onConnectionFocusChange({
      incoming: !connectionFocus.incoming,
      outgoing: connectionFocus.outgoing
    })
  }

  const toggleOutgoing = () => {
    onConnectionFocusChange({
      incoming: connectionFocus.incoming,
      outgoing: !connectionFocus.outgoing
    })
  }

  const clearFocus = () => {
    onConnectionFocusChange({ incoming: false, outgoing: false })
  }

  return (
    <div className="w-96 h-full bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className={cn('p-4 border-b border-border', config.bgColor)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', config.bgColor, 'border', config.borderColor)}>
              <Icon className={cn('w-5 h-5', config.color)} />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{entity.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className={cn('text-xs', config.color, config.borderColor)}>
                  {config.label}
                </Badge>
                <Badge variant="outline" className={cn('text-xs', status.color)}>
                  {status.label}
                </Badge>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {config.dimension}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && !isEditing && (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
              </>
            )}
            {canEdit && isEditing && (
              <>
                <Button variant="default" size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input
                  value={draft.name}
                  onChange={(e) => updateDraft({ name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <select
                    value={draft.type}
                    onChange={(e) => updateDraft({ type: e.target.value as Entity['type'] })}
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
                    value={draft.status}
                    onChange={(e) => updateDraft({ status: e.target.value as Entity['status'] })}
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
                    value={draft.owner}
                    onChange={(e) => updateDraft({ owner: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Criticality</Label>
                  <select
                    value={draft.criticality}
                    onChange={(e) => updateDraft({ criticality: e.target.value as Entity['criticality'] })}
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
                  value={draft.zoneId ?? ''}
                  onChange={(e) => updateDraft({ zoneId: e.target.value || undefined })}
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
                  value={draft.description}
                  onChange={(e) => updateDraft({ description: e.target.value })}
                  className="mt-1 min-h-[80px] w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Tags (comma separated)</Label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Children IDs (comma separated)</Label>
                <Input
                  value={childrenInput}
                  onChange={(e) => setChildrenInput(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Metadata (JSON)</Label>
                <textarea
                  value={metadataInput}
                  onChange={(e) => setMetadataInput(e.target.value)}
                  className="mt-1 min-h-[120px] w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
                />
                {metadataError && (
                  <p className="mt-1 text-xs text-red-400">{metadataError}</p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="text-sm text-foreground">{entity.description}</p>
              </div>

              <Separator />

              {/* Graph Focus */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  Graph Focus
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={connectionFocus.incoming ? 'default' : 'outline'}
                    onClick={toggleIncoming}
                  >
                    Incoming
                  </Button>
                  <Button
                    size="sm"
                    variant={connectionFocus.outgoing ? 'default' : 'outline'}
                    onClick={toggleOutgoing}
                  >
                    Outgoing
                  </Button>
                  {focusActive && (
                    <Button size="sm" variant="ghost" onClick={clearFocus}>
                      Clear
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Show only the selected incoming/outgoing connections on the graph.
                </p>
              </div>

          {/* Zone Info */}
          {zoneEntity && zoneConfig && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security Zone
                </h3>
                <button
                  onClick={() => onNavigate(zoneEntity.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                    zoneConfig.bgColor,
                    'hover:opacity-80'
                  )}
                >
                  <MapPin className={cn('w-4 h-4', zoneConfig.color)} />
                  <div>
                    <p className={cn('text-sm font-medium', zoneConfig.color)}>{zoneEntity.name}</p>
                    <p className="text-xs text-muted-foreground">{zoneConfig.label}</p>
                  </div>
                </button>
                {zoneCrossingCount > 0 && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400">
                      {zoneCrossingCount} zone-crossing relationship{zoneCrossingCount > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Properties */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Properties</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Owner</p>
                  <p className="text-sm text-foreground">{entity.owner}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Criticality</p>
                  <Badge className={cn('text-xs capitalize', criticalityColors[entity.criticality])}>
                    {entity.criticality}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Tags */}
            {entity.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Tags</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {entity.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            {Object.keys(entity.metadata).length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Metadata</p>
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  {Object.entries(entity.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{key}</span>
                      <span className="text-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Children */}
            {entity.children && entity.children.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Contains ({entity.children.length})</p>
                <div className="space-y-1">
                  {entity.children.map(childId => {
                    const child = getEntityById(childId)
                    if (!child) return null
                    const childConfig = entityTypeConfig[child.type]
                    return (
                      <button
                        key={childId}
                        onClick={() => onNavigate(childId)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className={cn('w-2 h-2 rounded-full', childConfig.color.replace('text-', 'bg-'))} />
                        <span className="text-sm text-foreground truncate">{child.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{childConfig.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Relationships */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Relationships</h3>

            {/* Incoming */}
            {incomingRelations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Incoming ({incomingRelations.length})</p>
                </div>
                <div className="space-y-2">
                  {incomingRelations.map(rel => {
                    const fromEntity = getEntityById(rel.fromEntityId)
                    if (!fromEntity) return null
                    const relConfig = relationshipTypeConfig[rel.type]
                    const fromConfig = entityTypeConfig[fromEntity.type]
                    const isCrossing = isZoneCrossing(rel, entities)
                    return (
                      <button
                        key={rel.id}
                        onClick={() => onNavigate(fromEntity.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left',
                          isCrossing 
                            ? 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20'
                            : 'bg-muted/30 hover:bg-muted/50'
                        )}
                      >
                        <div className={cn('w-2 h-2 rounded-full', fromConfig.color.replace('text-', 'bg-'))} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{fromEntity.name}</p>
                          <div className="flex items-center gap-1">
                            <p className="text-xs" style={{ color: relConfig.color }}>
                              {relConfig.label}
                            </p>
                            {isCrossing && (
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Outgoing */}
            {outgoingRelations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Outgoing ({outgoingRelations.length})</p>
                </div>
                <div className="space-y-2">
                  {outgoingRelations.map(rel => {
                    const toEntity = getEntityById(rel.toEntityId)
                    if (!toEntity) return null
                    const relConfig = relationshipTypeConfig[rel.type]
                    const toConfig = entityTypeConfig[toEntity.type]
                    const isCrossing = isZoneCrossing(rel, entities)
                    return (
                      <button
                        key={rel.id}
                        onClick={() => onNavigate(toEntity.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left',
                          isCrossing 
                            ? 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20'
                            : 'bg-muted/30 hover:bg-muted/50'
                        )}
                      >
                        <div className={cn('w-2 h-2 rounded-full', toConfig.color.replace('text-', 'bg-'))} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{toEntity.name}</p>
                          <div className="flex items-center gap-1">
                            <p className="text-xs" style={{ color: relConfig.color }}>
                              {relConfig.label}
                            </p>
                            {isCrossing && (
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {incomingRelations.length === 0 && outgoingRelations.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No relationships</p>
            )}
          </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
