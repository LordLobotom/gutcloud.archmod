import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'pg'
import { mockEntities, mockRelationships } from '../lib/mock-data'
import type { Entity, Relationship } from '../lib/types'

const args = new Set(process.argv.slice(2))
const reset = args.has('--reset')
const schemaOnly = args.has('--schema-only')
const seedOnly = args.has('--seed-only')

if (schemaOnly && seedOnly) {
  console.error('Use only one of --schema-only or --seed-only')
  process.exit(1)
}

const dbUrl = process.env.SUPABASE_DB_URL
if (!dbUrl) {
  console.error('Missing SUPABASE_DB_URL in environment or .env')
  process.exit(1)
}

const useSsl = !/localhost|127\.0\.0\.1/.test(dbUrl)
const client = new Client({
  connectionString: dbUrl,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined
})

function stripZoneType(entities: Array<Entity | (Entity & { zoneType?: string })>): Entity[] {
  return entities.map((entity) => {
    const { zoneType: _zoneType, ...rest } = entity as Entity & { zoneType?: string }
    return rest
  })
}

function mapEntityValues(entity: Entity) {
  return [
    entity.id,
    entity.type,
    entity.name,
    entity.description,
    entity.status,
    entity.owner,
    entity.criticality,
    JSON.stringify(entity.tags ?? []),
    JSON.stringify(entity.metadata ?? {}),
    entity.children ? JSON.stringify(entity.children) : null,
    entity.zoneId ?? null,
    entity.position ? JSON.stringify(entity.position) : null
  ]
}

function mapRelationshipValues(rel: Relationship) {
  return [
    rel.id,
    rel.fromEntityId,
    rel.toEntityId,
    rel.type,
    rel.bidirectional,
    rel.strength,
    rel.notes ?? null,
    rel.crossesZone ?? null,
    rel.fromZone ?? null,
    rel.toZone ?? null
  ]
}

async function upsertEntities(entities: Entity[]) {
  const sql = `
    insert into public.entities
      (id, type, name, description, status, owner, criticality, tags, metadata, children, zone_id, position)
    values
      ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11, $12::jsonb)
    on conflict (id) do update set
      type = excluded.type,
      name = excluded.name,
      description = excluded.description,
      status = excluded.status,
      owner = excluded.owner,
      criticality = excluded.criticality,
      tags = excluded.tags,
      metadata = excluded.metadata,
      children = excluded.children,
      zone_id = excluded.zone_id,
      position = excluded.position,
      updated_at = now();
  `

  for (const entity of entities) {
    await client.query(sql, mapEntityValues(entity))
  }
}

async function upsertRelationships(relationships: Relationship[]) {
  const sql = `
    insert into public.relationships
      (id, from_entity_id, to_entity_id, type, bidirectional, strength, notes, crosses_zone, from_zone, to_zone)
    values
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    on conflict (id) do update set
      from_entity_id = excluded.from_entity_id,
      to_entity_id = excluded.to_entity_id,
      type = excluded.type,
      bidirectional = excluded.bidirectional,
      strength = excluded.strength,
      notes = excluded.notes,
      crosses_zone = excluded.crosses_zone,
      from_zone = excluded.from_zone,
      to_zone = excluded.to_zone,
      updated_at = now();
  `

  for (const rel of relationships) {
    await client.query(sql, mapRelationshipValues(rel))
  }
}

async function run() {
  await client.connect()

  try {
    if (!seedOnly) {
      const schemaPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'supabase', 'schema.sql')
      const schemaSql = await fs.readFile(schemaPath, 'utf8')
      await client.query(schemaSql)
      console.log('Schema applied.')
    }

    if (!schemaOnly) {
      if (reset) {
        await client.query('delete from public.relationships')
        await client.query('delete from public.entities')
      }

      const entities = stripZoneType(mockEntities)
      await upsertEntities(entities)
      await upsertRelationships(mockRelationships)
      console.log(`Seeded ${entities.length} entities and ${mockRelationships.length} relationships.`)
    }
  } finally {
    await client.end()
  }
}

run().catch((error) => {
  console.error('Supabase init failed:', error)
  process.exit(1)
})
