import type { Entity, Relationship, ZoneType } from './types'

// Security Zones (Purdue Model)
export const mockZones: Array<Entity & { zoneType: ZoneType }> = [
  {
    id: 'zone-l0',
    type: 'zone',
    name: 'Level 0 - Physical Process',
    description: 'Physical production processes, sensors, actuators',
    status: 'as-is',
    owner: 'OT Security',
    criticality: 'critical',
    tags: ['purdue', 'ot'],
    metadata: { purdueLevel: 0 },
    zoneType: 'level0'
  },
  {
    id: 'zone-l1',
    type: 'zone',
    name: 'Level 1 - Basic Control',
    description: 'PLCs, RTUs, DCS controllers',
    status: 'as-is',
    owner: 'OT Security',
    criticality: 'critical',
    tags: ['purdue', 'ot'],
    metadata: { purdueLevel: 1 },
    zoneType: 'level1'
  },
  {
    id: 'zone-l2',
    type: 'zone',
    name: 'Level 2 - Supervisory',
    description: 'HMI, SCADA, local control rooms',
    status: 'as-is',
    owner: 'OT Security',
    criticality: 'critical',
    tags: ['purdue', 'ot'],
    metadata: { purdueLevel: 2 },
    zoneType: 'level2'
  },
  {
    id: 'zone-l3',
    type: 'zone',
    name: 'Level 3 - Site Operations',
    description: 'MES, Historian, batch management',
    status: 'as-is',
    owner: 'OT Security',
    criticality: 'high',
    tags: ['purdue', 'ot-it'],
    metadata: { purdueLevel: 3 },
    zoneType: 'level3'
  },
  {
    id: 'zone-dmz',
    type: 'zone',
    name: 'Level 3.5 - DMZ',
    description: 'Industrial demilitarized zone',
    status: 'as-is',
    owner: 'IT Security',
    criticality: 'critical',
    tags: ['purdue', 'dmz'],
    metadata: { purdueLevel: 3.5 },
    zoneType: 'level3.5'
  },
  {
    id: 'zone-l4',
    type: 'zone',
    name: 'Level 4 - Enterprise IT',
    description: 'ERP, business systems, corporate applications',
    status: 'as-is',
    owner: 'IT Security',
    criticality: 'high',
    tags: ['purdue', 'it'],
    metadata: { purdueLevel: 4 },
    zoneType: 'level4'
  },
  {
    id: 'zone-cloud',
    type: 'zone',
    name: 'Cloud - Azure',
    description: 'Azure cloud services and applications',
    status: 'as-is',
    owner: 'Cloud Team',
    criticality: 'high',
    tags: ['cloud', 'azure'],
    metadata: { provider: 'Azure' },
    zoneType: 'cloud'
  }
]

export const mockEntities: Entity[] = [
  // Include zones as entities
  ...mockZones,

  // ===== BUSINESS LAYER =====
  {
    id: 'cap-production',
    type: 'capability',
    name: 'Production Management',
    description: 'End-to-end manufacturing production capability',
    status: 'as-is',
    owner: 'VP Manufacturing',
    criticality: 'critical',
    tags: ['core', 'manufacturing'],
    metadata: { department: 'Manufacturing' },
    children: ['proc-assembly', 'proc-quality']
  },
  {
    id: 'cap-supply',
    type: 'capability',
    name: 'Supply Chain',
    description: 'Materials and logistics management',
    status: 'as-is',
    owner: 'VP Supply Chain',
    criticality: 'high',
    tags: ['core', 'logistics'],
    metadata: { department: 'Supply Chain' },
    children: ['proc-inventory', 'proc-procurement']
  },
  {
    id: 'cap-analytics',
    type: 'capability',
    name: 'Operational Analytics',
    description: 'Manufacturing intelligence and reporting',
    status: 'to-be',
    owner: 'Chief Data Officer',
    criticality: 'high',
    tags: ['analytics', 'digital'],
    metadata: { department: 'Digital' },
    children: ['proc-reporting']
  },

  // Processes
  {
    id: 'proc-assembly',
    type: 'process',
    name: 'Assembly Process',
    description: 'Main product assembly workflow',
    status: 'as-is',
    owner: 'Production Manager',
    criticality: 'critical',
    tags: ['core', 'automated'],
    metadata: { cycleTime: '45 min' },
    zoneId: 'zone-l3'
  },
  {
    id: 'proc-quality',
    type: 'process',
    name: 'Quality Control',
    description: 'In-line quality inspection process',
    status: 'as-is',
    owner: 'Quality Manager',
    criticality: 'high',
    tags: ['quality', 'automated'],
    metadata: { defectTarget: '<0.1%' },
    zoneId: 'zone-l3'
  },
  {
    id: 'proc-inventory',
    type: 'process',
    name: 'Inventory Management',
    description: 'Stock tracking and replenishment',
    status: 'as-is',
    owner: 'Inventory Team',
    criticality: 'high',
    tags: ['logistics'],
    metadata: { reorderPoint: '20%' },
    zoneId: 'zone-l4'
  },
  {
    id: 'proc-procurement',
    type: 'process',
    name: 'Procurement',
    description: 'Material ordering and vendor management',
    status: 'as-is',
    owner: 'Procurement Team',
    criticality: 'medium',
    tags: ['supply'],
    metadata: {},
    zoneId: 'zone-l4'
  },
  {
    id: 'proc-reporting',
    type: 'process',
    name: 'Production Reporting',
    description: 'OEE and KPI reporting to management',
    status: 'as-is',
    owner: 'BI Team',
    criticality: 'medium',
    tags: ['analytics', 'reporting'],
    metadata: { frequency: 'hourly' },
    zoneId: 'zone-l4'
  },

  // ===== OT / MANUFACTURING LAYER =====
  {
    id: 'line-main',
    type: 'productionLine',
    name: 'Main Assembly Line',
    description: 'Primary product assembly line with 12 stations',
    status: 'as-is',
    owner: 'Line Manager',
    criticality: 'critical',
    tags: ['assembly', 'automated'],
    metadata: { stations: 12, throughput: '120 units/hour' },
    children: ['machine-robot1', 'machine-robot2', 'machine-conveyor'],
    zoneId: 'zone-l0'
  },
  {
    id: 'line-packaging',
    type: 'productionLine',
    name: 'Packaging Line',
    description: 'End-of-line packaging and palletizing',
    status: 'as-is',
    owner: 'Line Manager',
    criticality: 'high',
    tags: ['packaging', 'automated'],
    metadata: { throughput: '150 units/hour' },
    children: ['machine-packager'],
    zoneId: 'zone-l0'
  },

  // Machines
  {
    id: 'machine-robot1',
    type: 'machine',
    name: 'Assembly Robot A1',
    description: 'KUKA robotic arm for component assembly',
    status: 'as-is',
    owner: 'Maintenance',
    criticality: 'critical',
    tags: ['robot', 'kuka'],
    metadata: { model: 'KUKA KR 16', serialNo: 'KR16-2024-001' },
    children: ['plc-robot1'],
    zoneId: 'zone-l0'
  },
  {
    id: 'machine-robot2',
    type: 'machine',
    name: 'Welding Robot W1',
    description: 'Automated welding station',
    status: 'as-is',
    owner: 'Maintenance',
    criticality: 'critical',
    tags: ['robot', 'welding'],
    metadata: { model: 'Fanuc ArcMate', serialNo: 'FM-2023-042' },
    children: ['plc-weld1'],
    zoneId: 'zone-l0'
  },
  {
    id: 'machine-conveyor',
    type: 'machine',
    name: 'Main Conveyor System',
    description: 'Interconnecting conveyor between stations',
    status: 'as-is',
    owner: 'Maintenance',
    criticality: 'high',
    tags: ['conveyor', 'material-handling'],
    metadata: { length: '120m', speed: '0.5 m/s' },
    children: ['plc-conv1'],
    zoneId: 'zone-l0'
  },
  {
    id: 'machine-packager',
    type: 'machine',
    name: 'Auto Packager',
    description: 'Automated case packing machine',
    status: 'as-is',
    owner: 'Maintenance',
    criticality: 'high',
    tags: ['packaging'],
    metadata: { model: 'Krones Variopac' },
    children: ['plc-pack1'],
    zoneId: 'zone-l0'
  },

  // PLCs
  {
    id: 'plc-robot1',
    type: 'plc',
    name: 'PLC-Robot-A1',
    description: 'Siemens S7-1500 controlling Assembly Robot A1',
    status: 'as-is',
    owner: 'Automation Eng',
    criticality: 'critical',
    tags: ['siemens', 's7-1500'],
    metadata: { model: 'S7-1518F', ip: '10.0.1.10' },
    children: ['sig-robot1-pos', 'sig-robot1-status', 'sig-robot1-torque'],
    zoneId: 'zone-l1'
  },
  {
    id: 'plc-weld1',
    type: 'plc',
    name: 'PLC-Weld-W1',
    description: 'Allen Bradley controlling Welding Robot',
    status: 'as-is',
    owner: 'Automation Eng',
    criticality: 'critical',
    tags: ['allen-bradley', 'controllogix'],
    metadata: { model: 'ControlLogix 5580', ip: '10.0.1.20' },
    children: ['sig-weld-current', 'sig-weld-temp'],
    zoneId: 'zone-l1'
  },
  {
    id: 'plc-conv1',
    type: 'plc',
    name: 'PLC-Conveyor',
    description: 'Siemens S7-1200 for conveyor control',
    status: 'as-is',
    owner: 'Automation Eng',
    criticality: 'high',
    tags: ['siemens', 's7-1200'],
    metadata: { model: 'S7-1214C', ip: '10.0.1.30' },
    children: ['sig-conv-speed', 'sig-conv-position'],
    zoneId: 'zone-l1'
  },
  {
    id: 'plc-pack1',
    type: 'plc',
    name: 'PLC-Packager',
    description: 'Beckhoff TwinCAT for packaging machine',
    status: 'as-is',
    owner: 'Automation Eng',
    criticality: 'high',
    tags: ['beckhoff', 'twincat'],
    metadata: { model: 'CX2040', ip: '10.0.1.40' },
    children: ['sig-pack-count'],
    zoneId: 'zone-l1'
  },

  // Signals
  {
    id: 'sig-robot1-pos',
    type: 'signal',
    name: 'Robot A1 Position',
    description: 'Current joint positions (J1-J6)',
    status: 'as-is',
    owner: 'Automation',
    criticality: 'high',
    tags: ['position', 'real-time'],
    metadata: { dataType: 'REAL[6]', scanRate: '100ms' },
    zoneId: 'zone-l1'
  },
  {
    id: 'sig-robot1-status',
    type: 'signal',
    name: 'Robot A1 Status',
    description: 'Operating status and fault codes',
    status: 'as-is',
    owner: 'Automation',
    criticality: 'critical',
    tags: ['status', 'alarm'],
    metadata: { dataType: 'DWORD', scanRate: '100ms' },
    zoneId: 'zone-l1'
  },
  {
    id: 'sig-robot1-torque',
    type: 'signal',
    name: 'Robot A1 Torque',
    description: 'Motor torque values for predictive maintenance',
    status: 'as-is',
    owner: 'Automation',
    criticality: 'medium',
    tags: ['torque', 'predictive'],
    metadata: { dataType: 'REAL[6]', scanRate: '500ms' },
    zoneId: 'zone-l1'
  },
  {
    id: 'sig-weld-current',
    type: 'signal',
    name: 'Weld Current',
    description: 'Welding current in amperes',
    status: 'as-is',
    owner: 'Automation',
    criticality: 'high',
    tags: ['welding', 'quality'],
    metadata: { dataType: 'REAL', unit: 'A', scanRate: '50ms' },
    zoneId: 'zone-l1'
  },
  {
    id: 'sig-weld-temp',
    type: 'signal',
    name: 'Weld Temperature',
    description: 'Weld pool temperature',
    status: 'as-is',
    owner: 'Automation',
    criticality: 'high',
    tags: ['welding', 'temperature'],
    metadata: { dataType: 'REAL', unit: 'C', scanRate: '100ms' },
    zoneId: 'zone-l1'
  },
  {
    id: 'sig-conv-speed',
    type: 'signal',
    name: 'Conveyor Speed',
    description: 'Current belt speed',
    status: 'as-is',
    owner: 'Automation',
    criticality: 'medium',
    tags: ['speed'],
    metadata: { dataType: 'REAL', unit: 'm/s', scanRate: '200ms' },
    zoneId: 'zone-l1'
  },
  {
    id: 'sig-conv-position',
    type: 'signal',
    name: 'Part Position',
    description: 'Part tracking position on conveyor',
    status: 'as-is',
    owner: 'Automation',
    criticality: 'high',
    tags: ['tracking'],
    metadata: { dataType: 'REAL', unit: 'm', scanRate: '100ms' },
    zoneId: 'zone-l1'
  },
  {
    id: 'sig-pack-count',
    type: 'signal',
    name: 'Pack Count',
    description: 'Units packaged counter',
    status: 'as-is',
    owner: 'Automation',
    criticality: 'medium',
    tags: ['counter', 'production'],
    metadata: { dataType: 'DINT', scanRate: '1s' },
    zoneId: 'zone-l1'
  },

  // MES Functions
  {
    id: 'mes-dispatch',
    type: 'mesFunction',
    name: 'Work Order Dispatch',
    description: 'Production order scheduling and dispatch',
    status: 'as-is',
    owner: 'MES Team',
    criticality: 'critical',
    tags: ['scheduling', 'isa-95'],
    metadata: { standard: 'ISA-95 Level 3' },
    zoneId: 'zone-l3'
  },
  {
    id: 'mes-tracking',
    type: 'mesFunction',
    name: 'Production Tracking',
    description: 'Real-time production status and genealogy',
    status: 'as-is',
    owner: 'MES Team',
    criticality: 'critical',
    tags: ['tracking', 'genealogy'],
    metadata: { standard: 'ISA-95 Level 3' },
    zoneId: 'zone-l3'
  },
  {
    id: 'mes-quality',
    type: 'mesFunction',
    name: 'Quality Management',
    description: 'In-process quality data collection',
    status: 'as-is',
    owner: 'MES Team',
    criticality: 'high',
    tags: ['quality', 'spc'],
    metadata: {},
    zoneId: 'zone-l3'
  },

  // ===== IT / APPLICATIONS LAYER =====
  {
    id: 'app-ignition',
    type: 'application',
    name: 'Ignition SCADA',
    description: 'Inductive Automation Ignition for HMI/SCADA',
    status: 'as-is',
    owner: 'OT Applications',
    criticality: 'critical',
    tags: ['scada', 'ignition', 'inductive'],
    metadata: { version: '8.1.33', vendor: 'Inductive Automation' },
    zoneId: 'zone-l2'
  },
  {
    id: 'app-mes',
    type: 'application',
    name: 'AVEVA MES',
    description: 'Manufacturing Execution System',
    status: 'as-is',
    owner: 'MES Team',
    criticality: 'critical',
    tags: ['mes', 'aveva'],
    metadata: { version: '2023', vendor: 'AVEVA' },
    zoneId: 'zone-l3'
  },
  {
    id: 'app-sap-pp',
    type: 'application',
    name: 'SAP PP',
    description: 'SAP Production Planning module',
    status: 'as-is',
    owner: 'SAP Team',
    criticality: 'critical',
    tags: ['sap', 'erp', 'planning'],
    metadata: { module: 'PP', version: 'S/4HANA 2023' },
    zoneId: 'zone-l4'
  },
  {
    id: 'app-sap-mm',
    type: 'application',
    name: 'SAP MM',
    description: 'SAP Materials Management module',
    status: 'as-is',
    owner: 'SAP Team',
    criticality: 'high',
    tags: ['sap', 'erp', 'inventory'],
    metadata: { module: 'MM', version: 'S/4HANA 2023' },
    zoneId: 'zone-l4'
  },
  {
    id: 'app-sap-custom',
    type: 'application',
    name: 'SAP Z-Programs',
    description: 'Custom ABAP programs for manufacturing',
    status: 'legacy',
    owner: 'SAP Team',
    criticality: 'high',
    tags: ['sap', 'custom', 'abap'],
    metadata: { count: 47, technicalDebt: 'high' },
    zoneId: 'zone-l4'
  },
  {
    id: 'app-powerbi',
    type: 'application',
    name: 'Power BI',
    description: 'Manufacturing dashboards and reports',
    status: 'as-is',
    owner: 'BI Team',
    criticality: 'medium',
    tags: ['bi', 'reporting', 'microsoft'],
    metadata: { vendor: 'Microsoft', license: 'Pro' },
    zoneId: 'zone-cloud'
  },
  {
    id: 'app-microstrategy',
    type: 'application',
    name: 'MicroStrategy',
    description: 'Enterprise analytics platform',
    status: 'legacy',
    owner: 'BI Team',
    criticality: 'medium',
    tags: ['bi', 'legacy', 'analytics'],
    metadata: { version: '2021', migrationTarget: 'Power BI' },
    zoneId: 'zone-l4'
  },

  // ===== DATA LAYER =====
  {
    id: 'db-historian',
    type: 'timeSeries',
    name: 'Ignition Historian',
    description: 'Time-series database for process data',
    status: 'as-is',
    owner: 'OT Applications',
    criticality: 'critical',
    tags: ['historian', 'time-series'],
    metadata: { retention: '5 years', dataPoints: '50M/day' },
    zoneId: 'zone-l3'
  },
  {
    id: 'db-mes',
    type: 'database',
    name: 'MES SQL Database',
    description: 'MSSQL database for MES application',
    status: 'as-is',
    owner: 'DBA Team',
    criticality: 'critical',
    tags: ['mssql', 'mes'],
    metadata: { engine: 'MSSQL 2019', size: '2TB' },
    zoneId: 'zone-l3'
  },
  {
    id: 'db-sap-hana',
    type: 'database',
    name: 'SAP HANA',
    description: 'In-memory database for SAP S/4HANA',
    status: 'as-is',
    owner: 'SAP Basis',
    criticality: 'critical',
    tags: ['hana', 'sap', 'in-memory'],
    metadata: { version: '2.0 SPS06', memory: '1TB' },
    zoneId: 'zone-l4'
  },
  {
    id: 'db-azure-synapse',
    type: 'database',
    name: 'Azure Synapse',
    description: 'Cloud data warehouse for analytics',
    status: 'as-is',
    owner: 'Data Team',
    criticality: 'high',
    tags: ['azure', 'warehouse', 'analytics'],
    metadata: { service: 'Synapse Analytics' },
    zoneId: 'zone-cloud'
  },

  // Data Objects
  {
    id: 'data-workorder',
    type: 'dataObject',
    name: 'Work Order',
    description: 'Production work order master data',
    status: 'as-is',
    owner: 'Data Governance',
    criticality: 'critical',
    tags: ['master-data', 'production'],
    metadata: { source: 'SAP PP' },
    zoneId: 'zone-l4'
  },
  {
    id: 'data-material',
    type: 'dataObject',
    name: 'Material Master',
    description: 'Product and component material data',
    status: 'as-is',
    owner: 'Data Governance',
    criticality: 'critical',
    tags: ['master-data', 'material'],
    metadata: { recordCount: '125K', source: 'SAP MM' },
    zoneId: 'zone-l4'
  },
  {
    id: 'data-bom',
    type: 'dataObject',
    name: 'Bill of Materials',
    description: 'Product BOM structures',
    status: 'as-is',
    owner: 'Engineering',
    criticality: 'critical',
    tags: ['bom', 'engineering'],
    metadata: { avgLevels: 8 },
    zoneId: 'zone-l4'
  },

  // Files (Excel as first-class citizen)
  {
    id: 'file-schedule',
    type: 'file',
    name: 'Weekly Schedule.xlsx',
    description: 'Manual production schedule adjustments',
    status: 'legacy',
    owner: 'Planning Team',
    criticality: 'high',
    tags: ['excel', 'shadow-it', 'schedule'],
    metadata: { location: '\\\\fileserver\\planning\\', format: 'xlsx' },
    zoneId: 'zone-l4'
  },
  {
    id: 'file-quality-report',
    type: 'file',
    name: 'Quality_Daily.xlsx',
    description: 'Daily quality metrics export',
    status: 'legacy',
    owner: 'Quality Team',
    criticality: 'medium',
    tags: ['excel', 'export', 'quality'],
    metadata: { automated: false, frequency: 'daily' },
    zoneId: 'zone-l4'
  },

  // ===== INFRASTRUCTURE LAYER =====
  {
    id: 'host-scada1',
    type: 'host',
    name: 'SCADA-SRV-01',
    description: 'Primary Ignition Gateway server',
    status: 'as-is',
    owner: 'OT Infrastructure',
    criticality: 'critical',
    tags: ['vmware', 'scada'],
    metadata: { os: 'Windows Server 2022', cpu: '16 cores', ram: '64GB' },
    zoneId: 'zone-l2'
  },
  {
    id: 'host-mes1',
    type: 'host',
    name: 'MES-SRV-01',
    description: 'MES application server',
    status: 'as-is',
    owner: 'OT Infrastructure',
    criticality: 'critical',
    tags: ['vmware', 'mes'],
    metadata: { os: 'Windows Server 2019', cpu: '8 cores', ram: '32GB' },
    zoneId: 'zone-l3'
  },
  {
    id: 'host-sap1',
    type: 'host',
    name: 'SAP-APP-01',
    description: 'SAP application server',
    status: 'as-is',
    owner: 'SAP Basis',
    criticality: 'critical',
    tags: ['linux', 'sap'],
    metadata: { os: 'SUSE Linux 15', cpu: '32 cores', ram: '256GB' },
    zoneId: 'zone-l4'
  },

  // Network
  {
    id: 'net-ot',
    type: 'network',
    name: 'OT Network',
    description: 'Industrial control network segment',
    status: 'as-is',
    owner: 'OT Network Team',
    criticality: 'critical',
    tags: ['industrial', 'isolated'],
    metadata: { subnet: '10.0.0.0/16', vlan: '100-199' },
    zoneId: 'zone-l1'
  },
  {
    id: 'net-dmz',
    type: 'network',
    name: 'Industrial DMZ',
    description: 'DMZ between OT and IT',
    status: 'as-is',
    owner: 'Network Security',
    criticality: 'critical',
    tags: ['dmz', 'firewall'],
    metadata: { subnet: '10.1.0.0/24', firewall: 'Palo Alto' },
    zoneId: 'zone-dmz'
  },
  {
    id: 'net-it',
    type: 'network',
    name: 'IT Corporate Network',
    description: 'Corporate IT network',
    status: 'as-is',
    owner: 'IT Network Team',
    criticality: 'high',
    tags: ['corporate'],
    metadata: { subnet: '172.16.0.0/12' },
    zoneId: 'zone-l4'
  },

  // Protocols
  {
    id: 'proto-opcua',
    type: 'protocol',
    name: 'OPC UA',
    description: 'OPC Unified Architecture for PLC communication',
    status: 'as-is',
    owner: 'OT Standards',
    criticality: 'critical',
    tags: ['opc', 'industrial', 'standard'],
    metadata: { port: 4840, security: 'SignAndEncrypt' },
    zoneId: 'zone-l2'
  },
  {
    id: 'proto-modbus',
    type: 'protocol',
    name: 'Modbus TCP',
    description: 'Modbus TCP for legacy device communication',
    status: 'legacy',
    owner: 'OT Standards',
    criticality: 'high',
    tags: ['modbus', 'legacy'],
    metadata: { port: 502 },
    zoneId: 'zone-l1'
  },

  // Integrations
  {
    id: 'int-mes-sap',
    type: 'integration',
    name: 'MES-SAP Interface',
    description: 'Work order and confirmation exchange',
    status: 'as-is',
    owner: 'Integration Team',
    criticality: 'critical',
    tags: ['idoc', 'bi-directional'],
    metadata: { protocol: 'RFC/IDoc', frequency: 'real-time' },
    zoneId: 'zone-dmz'
  },
  {
    id: 'int-historian-synapse',
    type: 'integration',
    name: 'Historian to Cloud',
    description: 'Process data replication to Azure',
    status: 'as-is',
    owner: 'Data Team',
    criticality: 'high',
    tags: ['etl', 'cloud'],
    metadata: { method: 'Azure Data Factory', frequency: 'hourly' },
    zoneId: 'zone-dmz'
  }
]

export const mockRelationships: Relationship[] = [
  // ===== BUSINESS RELATIONSHIPS =====
  // Capability -> Process (decomposes)
  { id: 'rel-1', fromEntityId: 'cap-production', toEntityId: 'proc-assembly', type: 'decomposes', bidirectional: false, strength: 'strong' },
  { id: 'rel-2', fromEntityId: 'cap-production', toEntityId: 'proc-quality', type: 'decomposes', bidirectional: false, strength: 'strong' },
  { id: 'rel-3', fromEntityId: 'cap-supply', toEntityId: 'proc-inventory', type: 'decomposes', bidirectional: false, strength: 'strong' },
  { id: 'rel-4', fromEntityId: 'cap-supply', toEntityId: 'proc-procurement', type: 'decomposes', bidirectional: false, strength: 'normal' },
  { id: 'rel-5', fromEntityId: 'cap-analytics', toEntityId: 'proc-reporting', type: 'decomposes', bidirectional: false, strength: 'strong' },

  // ===== OT HIERARCHY =====
  // Production Line -> Machine
  { id: 'rel-10', fromEntityId: 'line-main', toEntityId: 'machine-robot1', type: 'decomposes', bidirectional: false, strength: 'strong' },
  { id: 'rel-11', fromEntityId: 'line-main', toEntityId: 'machine-robot2', type: 'decomposes', bidirectional: false, strength: 'strong' },
  { id: 'rel-12', fromEntityId: 'line-main', toEntityId: 'machine-conveyor', type: 'decomposes', bidirectional: false, strength: 'strong' },
  { id: 'rel-13', fromEntityId: 'line-packaging', toEntityId: 'machine-packager', type: 'decomposes', bidirectional: false, strength: 'strong' },

  // Machine -> PLC (controls)
  { id: 'rel-20', fromEntityId: 'plc-robot1', toEntityId: 'machine-robot1', type: 'controls', bidirectional: false, strength: 'strong' },
  { id: 'rel-21', fromEntityId: 'plc-weld1', toEntityId: 'machine-robot2', type: 'controls', bidirectional: false, strength: 'strong' },
  { id: 'rel-22', fromEntityId: 'plc-conv1', toEntityId: 'machine-conveyor', type: 'controls', bidirectional: false, strength: 'strong' },
  { id: 'rel-23', fromEntityId: 'plc-pack1', toEntityId: 'machine-packager', type: 'controls', bidirectional: false, strength: 'strong' },

  // PLC -> Signal (emits_signal)
  { id: 'rel-30', fromEntityId: 'plc-robot1', toEntityId: 'sig-robot1-pos', type: 'emits_signal', bidirectional: false, strength: 'normal' },
  { id: 'rel-31', fromEntityId: 'plc-robot1', toEntityId: 'sig-robot1-status', type: 'emits_signal', bidirectional: false, strength: 'strong' },
  { id: 'rel-32', fromEntityId: 'plc-robot1', toEntityId: 'sig-robot1-torque', type: 'emits_signal', bidirectional: false, strength: 'normal' },
  { id: 'rel-33', fromEntityId: 'plc-weld1', toEntityId: 'sig-weld-current', type: 'emits_signal', bidirectional: false, strength: 'strong' },
  { id: 'rel-34', fromEntityId: 'plc-weld1', toEntityId: 'sig-weld-temp', type: 'emits_signal', bidirectional: false, strength: 'strong' },
  { id: 'rel-35', fromEntityId: 'plc-conv1', toEntityId: 'sig-conv-speed', type: 'emits_signal', bidirectional: false, strength: 'normal' },
  { id: 'rel-36', fromEntityId: 'plc-conv1', toEntityId: 'sig-conv-position', type: 'emits_signal', bidirectional: false, strength: 'strong' },
  { id: 'rel-37', fromEntityId: 'plc-pack1', toEntityId: 'sig-pack-count', type: 'emits_signal', bidirectional: false, strength: 'normal' },

  // ===== SCADA/MES DATA COLLECTION =====
  // Ignition collects signals
  { id: 'rel-40', fromEntityId: 'app-ignition', toEntityId: 'sig-robot1-pos', type: 'collects', bidirectional: false, strength: 'normal' },
  { id: 'rel-41', fromEntityId: 'app-ignition', toEntityId: 'sig-robot1-status', type: 'collects', bidirectional: false, strength: 'strong' },
  { id: 'rel-42', fromEntityId: 'app-ignition', toEntityId: 'sig-weld-current', type: 'collects', bidirectional: false, strength: 'strong' },
  { id: 'rel-43', fromEntityId: 'app-ignition', toEntityId: 'sig-weld-temp', type: 'collects', bidirectional: false, strength: 'strong' },
  { id: 'rel-44', fromEntityId: 'app-ignition', toEntityId: 'sig-conv-position', type: 'collects', bidirectional: false, strength: 'normal' },
  { id: 'rel-45', fromEntityId: 'app-ignition', toEntityId: 'sig-pack-count', type: 'collects', bidirectional: false, strength: 'normal' },

  // Ignition -> Historian
  { id: 'rel-50', fromEntityId: 'app-ignition', toEntityId: 'db-historian', type: 'writes_to', bidirectional: false, strength: 'strong' },

  // Ignition uses OPC UA
  { id: 'rel-51', fromEntityId: 'app-ignition', toEntityId: 'proto-opcua', type: 'communicates_via', bidirectional: false, strength: 'strong' },

  // ===== MES LAYER =====
  // MES Functions -> MES App
  { id: 'rel-60', fromEntityId: 'app-mes', toEntityId: 'mes-dispatch', type: 'supports', bidirectional: false, strength: 'strong' },
  { id: 'rel-61', fromEntityId: 'app-mes', toEntityId: 'mes-tracking', type: 'supports', bidirectional: false, strength: 'strong' },
  { id: 'rel-62', fromEntityId: 'app-mes', toEntityId: 'mes-quality', type: 'supports', bidirectional: false, strength: 'strong' },

  // MES reads from Historian
  { id: 'rel-63', fromEntityId: 'app-mes', toEntityId: 'db-historian', type: 'reads_from', bidirectional: false, strength: 'strong' },
  { id: 'rel-64', fromEntityId: 'app-mes', toEntityId: 'db-mes', type: 'writes_to', bidirectional: false, strength: 'strong' },

  // Process -> MES Functions
  { id: 'rel-65', fromEntityId: 'proc-assembly', toEntityId: 'mes-dispatch', type: 'supported_by', bidirectional: false, strength: 'strong' },
  { id: 'rel-66', fromEntityId: 'proc-assembly', toEntityId: 'mes-tracking', type: 'supported_by', bidirectional: false, strength: 'strong' },
  { id: 'rel-67', fromEntityId: 'proc-quality', toEntityId: 'mes-quality', type: 'supported_by', bidirectional: false, strength: 'strong' },

  // ===== SAP INTEGRATION =====
  // SAP modules data
  { id: 'rel-70', fromEntityId: 'app-sap-pp', toEntityId: 'data-workorder', type: 'produces', bidirectional: false, strength: 'strong' },
  { id: 'rel-71', fromEntityId: 'app-sap-mm', toEntityId: 'data-material', type: 'produces', bidirectional: false, strength: 'strong' },
  { id: 'rel-72', fromEntityId: 'app-sap-pp', toEntityId: 'data-bom', type: 'consumes', bidirectional: false, strength: 'strong' },

  // SAP -> HANA
  { id: 'rel-73', fromEntityId: 'app-sap-pp', toEntityId: 'db-sap-hana', type: 'runs_on', bidirectional: false, strength: 'strong' },
  { id: 'rel-74', fromEntityId: 'app-sap-mm', toEntityId: 'db-sap-hana', type: 'runs_on', bidirectional: false, strength: 'strong' },
  { id: 'rel-75', fromEntityId: 'app-sap-custom', toEntityId: 'db-sap-hana', type: 'runs_on', bidirectional: false, strength: 'strong' },

  // MES-SAP Integration (ZONE CROSSING!)
  { id: 'rel-80', fromEntityId: 'int-mes-sap', toEntityId: 'app-mes', type: 'integrates_with', bidirectional: true, strength: 'strong', crossesZone: true, fromZone: 'zone-l3', toZone: 'zone-l4' },
  { id: 'rel-81', fromEntityId: 'int-mes-sap', toEntityId: 'app-sap-pp', type: 'integrates_with', bidirectional: true, strength: 'strong', crossesZone: true, fromZone: 'zone-l3', toZone: 'zone-l4' },

  // Process -> SAP
  { id: 'rel-82', fromEntityId: 'proc-assembly', toEntityId: 'app-sap-pp', type: 'supported_by', bidirectional: false, strength: 'strong' },
  { id: 'rel-83', fromEntityId: 'proc-inventory', toEntityId: 'app-sap-mm', type: 'supported_by', bidirectional: false, strength: 'strong' },

  // ===== ANALYTICS / BI =====
  // Historian to Cloud (ZONE CROSSING!)
  { id: 'rel-90', fromEntityId: 'int-historian-synapse', toEntityId: 'db-historian', type: 'reads_from', bidirectional: false, strength: 'strong', crossesZone: true, fromZone: 'zone-l3', toZone: 'zone-cloud' },
  { id: 'rel-91', fromEntityId: 'int-historian-synapse', toEntityId: 'db-azure-synapse', type: 'writes_to', bidirectional: false, strength: 'strong', crossesZone: true, fromZone: 'zone-l3', toZone: 'zone-cloud' },

  // PowerBI
  { id: 'rel-92', fromEntityId: 'app-powerbi', toEntityId: 'db-azure-synapse', type: 'reads_from', bidirectional: false, strength: 'strong' },
  { id: 'rel-93', fromEntityId: 'proc-reporting', toEntityId: 'app-powerbi', type: 'supported_by', bidirectional: false, strength: 'normal' },

  // Legacy MicroStrategy
  { id: 'rel-94', fromEntityId: 'app-microstrategy', toEntityId: 'db-sap-hana', type: 'reads_from', bidirectional: false, strength: 'normal' },

  // Excel files (shadow IT)
  { id: 'rel-95', fromEntityId: 'file-schedule', toEntityId: 'proc-assembly', type: 'used_in_process', bidirectional: false, strength: 'weak', notes: 'Manual override risk' },
  { id: 'rel-96', fromEntityId: 'file-quality-report', toEntityId: 'mes-quality', type: 'feeds', bidirectional: false, strength: 'weak', notes: 'Manual export' },

  // ===== INFRASTRUCTURE =====
  // Apps -> Hosts
  { id: 'rel-100', fromEntityId: 'app-ignition', toEntityId: 'host-scada1', type: 'runs_on', bidirectional: false, strength: 'strong' },
  { id: 'rel-101', fromEntityId: 'app-mes', toEntityId: 'host-mes1', type: 'runs_on', bidirectional: false, strength: 'strong' },
  { id: 'rel-102', fromEntityId: 'app-sap-pp', toEntityId: 'host-sap1', type: 'runs_on', bidirectional: false, strength: 'strong' },

  // Hosts -> Networks
  { id: 'rel-110', fromEntityId: 'host-scada1', toEntityId: 'net-ot', type: 'depends_on', bidirectional: false, strength: 'strong' },
  { id: 'rel-111', fromEntityId: 'host-mes1', toEntityId: 'net-dmz', type: 'depends_on', bidirectional: false, strength: 'strong' },
  { id: 'rel-112', fromEntityId: 'host-sap1', toEntityId: 'net-it', type: 'depends_on', bidirectional: false, strength: 'strong' },

  // DMZ connections (ZONE CROSSINGS!)
  { id: 'rel-120', fromEntityId: 'net-dmz', toEntityId: 'net-ot', type: 'crosses_zone', bidirectional: false, strength: 'strong', crossesZone: true, fromZone: 'zone-dmz', toZone: 'zone-l2', notes: 'Firewall controlled' },
  { id: 'rel-121', fromEntityId: 'net-dmz', toEntityId: 'net-it', type: 'crosses_zone', bidirectional: false, strength: 'strong', crossesZone: true, fromZone: 'zone-dmz', toZone: 'zone-l4', notes: 'Firewall controlled' }
]

// Helper to get initial node positions (layered layout by zone/dimension)
export function getInitialPositions(entities: Entity[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {}

  // Respect persisted positions when provided
  entities.forEach(entity => {
    if (entity.position) {
      positions[entity.id] = entity.position
    }
  })

  // Group entities by their dimension/zone for layered layout
  const zoneYPositions: Record<string, number> = {
    'zone-l0': 100,
    'zone-l1': 250,
    'zone-l2': 400,
    'zone-l3': 550,
    'zone-dmz': 700,
    'zone-l4': 850,
    'zone-cloud': 1000
  }

  const typeGroups: Record<string, { baseX: number; baseY: number; spacing: number }> = {
    // Zones at the left edge
    zone: { baseX: 50, baseY: 300, spacing: 120 },
    // Business layer at top
    capability: { baseX: 800, baseY: 50, spacing: 250 },
    process: { baseX: 700, baseY: 180, spacing: 180 },
    // OT Layer
    productionLine: { baseX: 200, baseY: 100, spacing: 300 },
    machine: { baseX: 150, baseY: 250, spacing: 200 },
    plc: { baseX: 100, baseY: 400, spacing: 180 },
    signal: { baseX: 50, baseY: 550, spacing: 120 },
    mesFunction: { baseX: 450, baseY: 550, spacing: 180 },
    // IT Layer
    application: { baseX: 600, baseY: 400, spacing: 180 },
    integration: { baseX: 400, baseY: 700, spacing: 200 },
    // Data Layer
    database: { baseX: 850, baseY: 550, spacing: 180 },
    timeSeries: { baseX: 750, baseY: 650, spacing: 180 },
    dataObject: { baseX: 950, baseY: 350, spacing: 150 },
    file: { baseX: 1100, baseY: 450, spacing: 150 },
    // Infrastructure
    host: { baseX: 1100, baseY: 600, spacing: 180 },
    network: { baseX: 1200, baseY: 750, spacing: 180 },
    protocol: { baseX: 350, baseY: 450, spacing: 150 },
    container: { baseX: 1150, baseY: 500, spacing: 150 },
    port: { baseX: 1250, baseY: 650, spacing: 120 }
  }

  const grouped: Record<string, Entity[]> = {}
  entities.forEach(e => {
    if (!grouped[e.type]) grouped[e.type] = []
    grouped[e.type].push(e)
  })

  Object.entries(grouped).forEach(([type, items]) => {
    const config = typeGroups[type as keyof typeof typeGroups] || { baseX: 500, baseY: 500, spacing: 150 }
    items.forEach((entity, i) => {
      // Stagger positions for better visibility
      const row = Math.floor(i / 4)
      const col = i % 4
      positions[entity.id] = {
        x: config.baseX + col * config.spacing,
        y: config.baseY + row * 100
      }
    })
  })

  return positions
}

// Helper to check if relationship crosses security zones
export function isZoneCrossing(rel: Relationship, entities: Entity[]): boolean {
  if (rel.crossesZone) return true

  const fromEntity = entities.find(e => e.id === rel.fromEntityId)
  const toEntity = entities.find(e => e.id === rel.toEntityId)

  if (!fromEntity?.zoneId || !toEntity?.zoneId) return false
  return fromEntity.zoneId !== toEntity.zoneId
}

// Get all zone-crossing relationships
export function getZoneCrossingRelationships(relationships: Relationship[], entities: Entity[]): Relationship[] {
  return relationships.filter(rel => isZoneCrossing(rel, entities))
}
