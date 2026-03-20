export interface ServiceDefinition {
  field: string
  label: string
  color: string
}

/** 11 service rings, inner (index 0) → outer (index 10)
 *  Colors reference CSS custom properties defined in index.css */
export const SERVICE_DEFINITIONS: ServiceDefinition[] = [
  { field: 's_bahn_vorhanden',            label: 'S-Bahn',              color: 'var(--viz-service-s-bahn)'     },
  { field: 'u_bahn_vorhanden',            label: 'U-Bahn',              color: 'var(--viz-service-u-bahn)'     },
  { field: 'tram_vorhanden',              label: 'Tram',                color: 'var(--viz-service-tram)'       },
  { field: 'bus_vorhanden',              label: 'Bus',                  color: 'var(--viz-service-bus)'        },
  { field: 'ods_vorhanden',              label: 'On-demand Shuttle',    color: 'var(--viz-service-ods)'        },
  { field: 'gaf_ts_vorhanden',            label: 'Carsharing',          color: 'var(--viz-service-carsharing)' },
  { field: 'gaf_bs_vorhanden',            label: 'Bikesharing',         color: 'var(--viz-service-bikesharing)'},
  { field: 'gaf_ls_vorhanden',            label: 'Leihscooter',         color: 'var(--viz-service-leihscooter)'},
  { field: 'gaf_ms_vorhanden',            label: 'Mietrad',             color: 'var(--viz-service-mietrad)'    },
  { field: 'radservicestation_vorhanden', label: 'Bike Service Station', color: 'var(--viz-service-bike-station)'},
  { field: 'radpumpe_vorhanden',          label: 'Bike Pump',           color: 'var(--viz-service-bike-pump)'  },
]

export type GroupKey = 's-bahn' | 'u-bahn' | 'tram' | 'bus' | 'none'

export const GROUP_COLORS: Record<GroupKey, string> = {
  's-bahn': 'var(--viz-group-s-bahn)',
  'u-bahn': 'var(--viz-group-u-bahn)',
  'tram':   'var(--viz-group-tram)',
  'bus':    'var(--viz-group-bus)',
  'none':   'var(--viz-group-none)',
}

export const GROUP_LABELS: Record<GroupKey, string> = {
  's-bahn': 'S-BAHN',
  'u-bahn': 'U-BAHN',
  'tram':   'TRAM',
  'bus':    'BUS',
  'none':   'OTHER',
}

/** Fill color for absent (Nein) arc segments */
export const ABSENT_COLOR = 'var(--viz-surface)'

/** Page background color */
export const BG_COLOR = 'var(--viz-bg)'

/** Center circle fill */
export const CENTER_FILL = 'var(--viz-surface)'
