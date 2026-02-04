// Entity Types - Industrial Enterprise Architecture
export type EntityType =
  // Business / Process Layer
  | 'capability'
  | 'process'
  // OT / Manufacturing Layer
  | 'productionLine'
  | 'machine'
  | 'plc'
  | 'signal'
  | 'mesFunction'
  // IT / Applications Layer
  | 'application'
  | 'integration'
  // Data Layer
  | 'dataObject'
  | 'database'
  | 'timeSeries'
  | 'file'
  // Infrastructure Layer
  | 'host'
  | 'container'
  | 'network'
  | 'port'
  | 'protocol'
  // Security / Zones
  | 'zone'

export type EntityStatus =
  | 'as-is'
  | 'to-be'
  | 'legacy'
  | 'target'
  | 'experiment'

export type Criticality = 'low' | 'medium' | 'high' | 'critical'

// Security Zone Types (Purdue-inspired)
export type ZoneType =
  | 'level0' // Physical process
  | 'level1' // Basic control (PLCs, sensors)
  | 'level2' // Area supervisory (HMI, SCADA)
  | 'level3' // Site operations (MES, Historian)
  | 'level3.5' // DMZ
  | 'level4' // Enterprise IT
  | 'level5' // Enterprise network / Cloud
  | 'cloud'

export interface Entity {
  id: string
  type: EntityType
  name: string
  description: string
  status: EntityStatus
  owner: string
  criticality: Criticality
  tags: string[]
  metadata: Record<string, unknown>
  children?: string[] // IDs of child entities for subgraph expansion
  zoneId?: string // Reference to security zone
  position?: { x: number; y: number } // Persisted node position
}

// Relationship Types - Extended for Industrial
export type RelationshipType =
  // Business relationships
  | 'supports'
  | 'realizes'
  | 'decomposes'
  // Data flow
  | 'consumes'
  | 'produces'
  | 'reads_from'
  | 'writes_to'
  | 'feeds'
  // OT/Manufacturing
  | 'controls'
  | 'emits_signal'
  | 'collects'
  // Infrastructure
  | 'runs_on'
  | 'hosts'
  | 'exposes_port'
  | 'communicates_via'
  // Dependencies
  | 'depends_on'
  | 'integrates_with'
  | 'supported_by'
  // Security
  | 'crosses_zone'
  | 'used_in_process'

export interface Relationship {
  id: string
  fromEntityId: string
  toEntityId: string
  type: RelationshipType
  bidirectional: boolean
  strength: 'weak' | 'normal' | 'strong'
  notes?: string
  crossesZone?: boolean // Flag for zone-crossing relationships
  fromZone?: string
  toZone?: string
}

// Dimension (View Axis) - Extended
export type Dimension =
  | 'business'
  | 'ot'
  | 'it'
  | 'data'
  | 'infrastructure'
  | 'security'

// Graph Node/Edge for visualization
export interface GraphNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Entity & { expanded?: boolean }
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type?: string
  data?: Relationship
  animated?: boolean
}

// Filter state
export interface FilterState {
  dimensions: Dimension[]
  entityTypes: EntityType[]
  statuses: EntityStatus[]
  searchQuery: string
  showZoneCrossings: boolean
  zoomLevel: 'high' | 'medium' | 'low' // Semantic zoom
}

// Entity type display config - Extended for Industrial
export const entityTypeConfig: Record<EntityType, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  dimension: Dimension
}> = {
  // Business Layer
  capability: {
    label: 'Capability',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    icon: 'target',
    dimension: 'business'
  },
  process: {
    label: 'Process',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/50',
    icon: 'workflow',
    dimension: 'business'
  },
  // OT / Manufacturing Layer
  productionLine: {
    label: 'Production Line',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
    icon: 'factory',
    dimension: 'ot'
  },
  machine: {
    label: 'Machine',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/50',
    icon: 'cog',
    dimension: 'ot'
  },
  plc: {
    label: 'PLC',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    icon: 'cpu',
    dimension: 'ot'
  },
  signal: {
    label: 'Signal',
    color: 'text-lime-400',
    bgColor: 'bg-lime-500/20',
    borderColor: 'border-lime-500/50',
    icon: 'activity',
    dimension: 'ot'
  },
  mesFunction: {
    label: 'MES Function',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20',
    borderColor: 'border-teal-500/50',
    icon: 'layers',
    dimension: 'ot'
  },
  // IT / Applications Layer
  application: {
    label: 'Application',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/20',
    borderColor: 'border-sky-500/50',
    icon: 'app-window',
    dimension: 'it'
  },
  integration: {
    label: 'Integration',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
    borderColor: 'border-indigo-500/50',
    icon: 'link',
    dimension: 'it'
  },
  // Data Layer
  dataObject: {
    label: 'Data Object',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/50',
    icon: 'database',
    dimension: 'data'
  },
  database: {
    label: 'Database',
    color: 'text-blue-300',
    bgColor: 'bg-blue-400/20',
    borderColor: 'border-blue-400/50',
    icon: 'cylinder',
    dimension: 'data'
  },
  timeSeries: {
    label: 'Time Series DB',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    icon: 'trending-up',
    dimension: 'data'
  },
  file: {
    label: 'File',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    icon: 'file-spreadsheet',
    dimension: 'data'
  },
  // Infrastructure Layer
  host: {
    label: 'Host',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/50',
    icon: 'server',
    dimension: 'infrastructure'
  },
  container: {
    label: 'Container',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    icon: 'box',
    dimension: 'infrastructure'
  },
  network: {
    label: 'Network',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
    borderColor: 'border-violet-500/50',
    icon: 'network',
    dimension: 'infrastructure'
  },
  port: {
    label: 'Port',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/50',
    icon: 'plug',
    dimension: 'infrastructure'
  },
  protocol: {
    label: 'Protocol',
    color: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-500/20',
    borderColor: 'border-fuchsia-500/50',
    icon: 'arrow-right-left',
    dimension: 'infrastructure'
  },
  // Security / Zones
  zone: {
    label: 'Security Zone',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/50',
    icon: 'shield',
    dimension: 'security'
  }
}

export const statusConfig: Record<EntityStatus, {
  label: string
  color: string
  bgColor: string
}> = {
  'as-is': { label: 'As-Is', color: 'text-slate-400', bgColor: 'bg-slate-500/20' },
  'to-be': { label: 'To-Be', color: 'text-sky-400', bgColor: 'bg-sky-500/20' },
  'legacy': { label: 'Legacy', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  'target': { label: 'Target', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  'experiment': { label: 'Experiment', color: 'text-pink-400', bgColor: 'bg-pink-500/20' }
}

export const zoneTypeConfig: Record<ZoneType, {
  label: string
  color: string
  bgColor: string
  level: number
}> = {
  'level0': { label: 'L0 - Physical Process', color: 'text-red-500', bgColor: 'bg-red-500/30', level: 0 },
  'level1': { label: 'L1 - Basic Control', color: 'text-orange-500', bgColor: 'bg-orange-500/30', level: 1 },
  'level2': { label: 'L2 - Supervisory', color: 'text-amber-500', bgColor: 'bg-amber-500/30', level: 2 },
  'level3': { label: 'L3 - Site Operations', color: 'text-yellow-500', bgColor: 'bg-yellow-500/30', level: 3 },
  'level3.5': { label: 'L3.5 - DMZ', color: 'text-lime-500', bgColor: 'bg-lime-500/30', level: 3.5 },
  'level4': { label: 'L4 - Enterprise IT', color: 'text-green-500', bgColor: 'bg-green-500/30', level: 4 },
  'level5': { label: 'L5 - Enterprise Network', color: 'text-teal-500', bgColor: 'bg-teal-500/30', level: 5 },
  'cloud': { label: 'Cloud', color: 'text-sky-500', bgColor: 'bg-sky-500/30', level: 6 }
}

export const relationshipTypeConfig: Record<RelationshipType, {
  label: string
  color: string
  style: 'solid' | 'dashed' | 'dotted'
}> = {
  // Business
  supports: { label: 'Supports', color: '#60a5fa', style: 'solid' },
  realizes: { label: 'Realizes', color: '#34d399', style: 'solid' },
  decomposes: { label: 'Decomposes', color: '#94a3b8', style: 'solid' },
  // Data flow
  consumes: { label: 'Consumes', color: '#f472b6', style: 'dashed' },
  produces: { label: 'Produces', color: '#a78bfa', style: 'dashed' },
  reads_from: { label: 'Reads From', color: '#22d3ee', style: 'dashed' },
  writes_to: { label: 'Writes To', color: '#fb923c', style: 'dashed' },
  feeds: { label: 'Feeds', color: '#84cc16', style: 'dashed' },
  // OT/Manufacturing
  controls: { label: 'Controls', color: '#fbbf24', style: 'solid' },
  emits_signal: { label: 'Emits Signal', color: '#a3e635', style: 'dotted' },
  collects: { label: 'Collects', color: '#2dd4bf', style: 'dashed' },
  // Infrastructure
  runs_on: { label: 'Runs On', color: '#fb7185', style: 'solid' },
  hosts: { label: 'Hosts', color: '#64748b', style: 'solid' },
  exposes_port: { label: 'Exposes Port', color: '#c084fc', style: 'dotted' },
  communicates_via: { label: 'Communicates Via', color: '#e879f9', style: 'dashed' },
  // Dependencies
  depends_on: { label: 'Depends On', color: '#fbbf24', style: 'solid' },
  integrates_with: { label: 'Integrates With', color: '#22d3ee', style: 'dotted' },
  supported_by: { label: 'Supported By', color: '#60a5fa', style: 'solid' },
  // Security
  crosses_zone: { label: 'Crosses Zone', color: '#ef4444', style: 'solid' },
  used_in_process: { label: 'Used In Process', color: '#10b981', style: 'dashed' }
}

// Semantic zoom level mappings
export const semanticZoomConfig: Record<'high' | 'medium' | 'low', EntityType[]> = {
  high: ['capability', 'productionLine', 'zone'], // Zoomed out - high level
  medium: ['capability', 'process', 'productionLine', 'machine', 'application', 'database', 'zone'], // Mid level
  low: [ // Zoomed in - all details
    'capability', 'process', 'productionLine', 'machine', 'plc', 'signal', 'mesFunction',
    'application', 'integration', 'dataObject', 'database', 'timeSeries', 'file',
    'host', 'container', 'network', 'port', 'protocol', 'zone'
  ]
}
