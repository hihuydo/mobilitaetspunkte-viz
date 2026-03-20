export interface ServiceDefinition {
  field: string
  label: string
  color: string
}

/** 11 service rings, inner (index 0) → outer (index 10) */
export const SERVICE_DEFINITIONS: ServiceDefinition[] = [
  { field: 's_bahn_vorhanden',          label: 'S-Bahn',              color: '#00A651' },
  { field: 'u_bahn_vorhanden',          label: 'U-Bahn',              color: '#0072BC' },
  { field: 'tram_vorhanden',            label: 'Tram',                color: '#CC0000' },
  { field: 'bus_vorhanden',             label: 'Bus',                 color: '#F7941D' },
  { field: 'ods_vorhanden',             label: 'On-demand Shuttle',   color: '#9B59B6' },
  { field: 'gaf_ts_vorhanden',          label: 'Carsharing',          color: '#E91E63' },
  { field: 'gaf_bs_vorhanden',          label: 'Bikesharing',         color: '#FFD600' },
  { field: 'gaf_ls_vorhanden',          label: 'Leihscooter',         color: '#00BCD4' },
  { field: 'gaf_ms_vorhanden',          label: 'Mietrad',             color: '#FF8A65' },
  { field: 'radservicestation_vorhanden', label: 'Bike Service Station', color: '#80CBC4' },
  { field: 'radpumpe_vorhanden',        label: 'Bike Pump',           color: '#B0BEC5' },
]

export type GroupKey = 's-bahn' | 'u-bahn' | 'tram' | 'bus' | 'none'

export const GROUP_COLORS: Record<GroupKey, string> = {
  's-bahn': '#00A651',
  'u-bahn': '#0072BC',
  'tram':   '#CC0000',
  'bus':    '#F7941D',
  'none':   '#4a7fa8',
}

export const GROUP_LABELS: Record<GroupKey, string> = {
  's-bahn': 'S-BAHN',
  'u-bahn': 'U-BAHN',
  'tram':   'TRAM',
  'bus':    'BUS',
  'none':   'OTHER',
}

/** Fill color for absent (Nein) arc segments */
export const ABSENT_COLOR = '#0a1220'

/** Page background color */
export const BG_COLOR = '#0f1b2d'

/** Center circle fill */
export const CENTER_FILL = '#0a1220'
