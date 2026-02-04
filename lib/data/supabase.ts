import type { Entity, Relationship } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'

function mapEntityFromDb(row: any): Entity {
  return {
    id: row.id,
    type: row.type,
    name: row.name ?? '',
    description: row.description ?? '',
    status: row.status ?? 'as-is',
    owner: row.owner ?? '',
    criticality: row.criticality ?? 'medium',
    tags: Array.isArray(row.tags) ? row.tags : [],
    metadata: row.metadata ?? {},
    children: Array.isArray(row.children) ? row.children : undefined,
    zoneId: row.zone_id ?? undefined,
    position: row.position ?? undefined
  }
}

function mapEntityToDb(entity: Entity) {
  return {
    id: entity.id,
    type: entity.type,
    name: entity.name,
    description: entity.description,
    status: entity.status,
    owner: entity.owner,
    criticality: entity.criticality,
    tags: entity.tags ?? [],
    metadata: entity.metadata ?? {},
    children: entity.children ?? [],
    zone_id: entity.zoneId ?? null,
    position: entity.position ?? null
  }
}

function mapRelationshipFromDb(row: any): Relationship {
  return {
    id: row.id,
    fromEntityId: row.from_entity_id,
    toEntityId: row.to_entity_id,
    type: row.type,
    bidirectional: row.bidirectional ?? false,
    strength: row.strength ?? 'normal',
    notes: row.notes ?? undefined,
    crossesZone: row.crosses_zone ?? undefined,
    fromZone: row.from_zone ?? undefined,
    toZone: row.to_zone ?? undefined
  }
}

function mapRelationshipToDb(relationship: Relationship) {
  return {
    id: relationship.id,
    from_entity_id: relationship.fromEntityId,
    to_entity_id: relationship.toEntityId,
    type: relationship.type,
    bidirectional: relationship.bidirectional,
    strength: relationship.strength,
    notes: relationship.notes ?? null,
    crosses_zone: relationship.crossesZone ?? null,
    from_zone: relationship.fromZone ?? null,
    to_zone: relationship.toZone ?? null
  }
}

export async function fetchEntities() {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from('entities').select('*')
  if (error) throw error
  return (data ?? []).map(mapEntityFromDb)
}

export async function fetchRelationships() {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from('relationships').select('*')
  if (error) throw error
  return (data ?? []).map(mapRelationshipFromDb)
}

export async function upsertEntity(entity: Entity) {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('entities').upsert(mapEntityToDb(entity))
  if (error) throw error
}

export async function upsertEntities(entities: Entity[]) {
  if (!supabase) throw new Error('Supabase not configured')
  if (entities.length === 0) return
  const { error } = await supabase.from('entities').upsert(entities.map(mapEntityToDb))
  if (error) throw error
}

export async function deleteEntity(id: string) {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('entities').delete().eq('id', id)
  if (error) throw error
}

export async function upsertRelationship(relationship: Relationship) {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('relationships').upsert(mapRelationshipToDb(relationship))
  if (error) throw error
}

export async function upsertRelationships(relationships: Relationship[]) {
  if (!supabase) throw new Error('Supabase not configured')
  if (relationships.length === 0) return
  const { error } = await supabase.from('relationships').upsert(relationships.map(mapRelationshipToDb))
  if (error) throw error
}

export async function deleteRelationship(id: string) {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('relationships').delete().eq('id', id)
  if (error) throw error
}

export async function clearRelationships() {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('relationships').delete().neq('id', '')
  if (error) throw error
}

export async function clearEntities() {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('entities').delete().neq('id', '')
  if (error) throw error
}
