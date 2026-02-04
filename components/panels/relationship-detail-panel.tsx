'use client'

import React from "react"
import { useEffect, useState } from 'react'

import {
  X,
  ArrowRightLeft,
  ArrowRight,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Relationship, Entity } from '@/lib/types'
import { entityTypeConfig, relationshipTypeConfig } from '@/lib/types'
import { isZoneCrossing } from '@/lib/mock-data'

interface RelationshipDetailPanelProps {
  relationship: Relationship | null
  entities: Entity[]
  onClose: () => void
  onNavigate: (entityId: string) => void
  onUpdateRelationship: (relationship: Relationship) => void
  onDeleteRelationship: (relationshipId: string) => void
  canEdit: boolean
}

export function RelationshipDetailPanel({
  relationship,
  entities,
  onClose,
  onNavigate,
  onUpdateRelationship,
  onDeleteRelationship,
  canEdit
}: RelationshipDetailPanelProps) {
  if (!relationship) return null

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<Relationship>(relationship)
  const [notesInput, setNotesInput] = useState('')

  useEffect(() => {
    setDraft(relationship)
    setNotesInput(relationship.notes ?? '')
    setIsEditing(false)
  }, [relationship])

  const relConfig = relationshipTypeConfig[relationship.type]
  const fromEntity = entities.find(e => e.id === relationship.fromEntityId)
  const toEntity = entities.find(e => e.id === relationship.toEntityId)
  const fromConfig = fromEntity ? entityTypeConfig[fromEntity.type] : null
  const toConfig = toEntity ? entityTypeConfig[toEntity.type] : null
  const crossing = isZoneCrossing(relationship, entities)

  const updateDraft = (partial: Partial<Relationship>) => {
    setDraft(prev => ({ ...prev, ...partial }))
  }

  const handleSave = () => {
    onUpdateRelationship({
      ...draft,
      notes: notesInput.trim() ? notesInput : undefined
    })
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (!canEdit) return
    if (window.confirm('Delete this relationship?')) {
      onDeleteRelationship(relationship.id)
    }
  }

  return (
    <div className="w-96 h-full bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: relConfig.color }}
              />
              <h2 className="font-semibold text-foreground">{relConfig.label}</h2>
              {crossing && (
                <Badge className="text-xs bg-red-500/20 text-red-400 border border-red-500/40">
                  Zone Crossing
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Relationship details and navigation
            </p>
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
                <Label className="text-xs text-muted-foreground">From</Label>
                <select
                  value={draft.fromEntityId}
                  onChange={(e) => updateDraft({ fromEntityId: e.target.value })}
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
                  value={draft.toEntityId}
                  onChange={(e) => updateDraft({ toEntityId: e.target.value })}
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
                    value={draft.type}
                    onChange={(e) => updateDraft({ type: e.target.value as Relationship['type'] })}
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
                    value={draft.strength}
                    onChange={(e) => updateDraft({ strength: e.target.value as Relationship['strength'] })}
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
                  checked={draft.bidirectional}
                  onChange={(e) => updateDraft({ bidirectional: e.target.checked })}
                />
                Bidirectional
              </label>

              <div>
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="mt-1 min-h-[120px] w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Entities */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Entities</h3>
                {fromEntity && fromConfig && (
                  <button
                    onClick={() => onNavigate(fromEntity.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                  >
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                    <div className={cn('w-2.5 h-2.5 rounded-full', fromConfig.color.replace('text-', 'bg-'))} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{fromEntity.name}</p>
                      <p className="text-xs text-muted-foreground">Source</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{fromConfig.label}</span>
                  </button>
                )}
                {toEntity && toConfig && (
                  <button
                    onClick={() => onNavigate(toEntity.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                  >
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className={cn('w-2.5 h-2.5 rounded-full', toConfig.color.replace('text-', 'bg-'))} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{toEntity.name}</p>
                      <p className="text-xs text-muted-foreground">Target</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{toConfig.label}</span>
                  </button>
                )}
              </div>

              <Separator />

              {/* Properties */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Properties</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm text-foreground">{relConfig.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: relConfig.color }} />
                    <div>
                      <p className="text-xs text-muted-foreground">Strength</p>
                      <p className="text-sm text-foreground capitalize">{relationship.strength}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Direction</p>
                      <p className="text-sm text-foreground">{relationship.bidirectional ? 'Bidirectional' : 'One-way'}</p>
                    </div>
                  </div>
                  {crossing && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <div>
                        <p className="text-xs text-muted-foreground">Security</p>
                        <p className="text-sm text-foreground">Crosses Zone</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {relationship.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm text-foreground">
                      {relationship.notes}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
