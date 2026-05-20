// Editorial guides for select Gurgaon micro-markets.
// Slugs match `LOCATIONS` in ./locations.ts.
// Copy is grounded and on-the-ground — no fake prices, statistics, project
// ownership claims, or invented branding.

export type Audience =
  | 'Families'
  | 'Professionals'
  | 'Students'
  | 'Investors'
  | 'Corporate employees'
  | 'Airbnb operators';

export type LandscapeItem = {
  kind: string; // e.g., 'Apartments', 'Builder floors', 'Villas', 'Commercial'
  note: string;
};

export type LocationGuide = {
  /** One- or two-paragraph editorial overview. */
  overview: string[];
  /** Who the area genuinely tends to suit. */
  suits: Audience[];
  /** The property landscape, in plain language. */
  landscape: LandscapeItem[];
  /** Considerations for renters and buyers. */
  considerations: {
    rentals: string;
    buying: string;
  };
};

export const LOCATION_GUIDES: Record<string, LocationGuide> = {
  'dlf-phase-3': {
    overview: [
      'DLF Phase 3 sits at the edge of Cyber City and Cyber Hub, which shapes most of its real estate character. Mature lanes of builder floors, a layer of society apartments, and one of the most active pre-occupied room and shared-living markets in Gurgaon all coexist within a short walk of each other.',
      'It is largely a renter market driven by professionals, bachelors and students working in the surrounding office clusters, with a growing layer of short-stay activity.',
    ],
    suits: [
      'Professionals',
      'Students',
      'Corporate employees',
      'Airbnb operators',
    ],
    landscape: [
      {
        kind: 'Builder floors',
        note: '1, 2 and 3 BHK floors across older and recently rebuilt lanes — the dominant stock.',
      },
      {
        kind: 'Apartments',
        note: 'Society apartments in select pockets, useful for tenants who want amenities and security.',
      },
      {
        kind: 'Pre-occupied rooms',
        note: 'A deep market for single rooms and shared accommodation, particularly close to Cyber Hub.',
      },
      {
        kind: 'Studios and 1 RK',
        note: 'Compact formats suited to young professionals and short-term assignments.',
      },
      {
        kind: 'Commercial',
        note: 'Pockets of high-street retail and small office formats along the main internal roads.',
      },
    ],
    considerations: {
      rentals:
        'Demand is steady year-round given Cyber Hub proximity. Deposits typically run two to three months and lock-ins are common. Parking in older lanes can be tight, and society norms for short-stay vary block by block — worth confirming before signing.',
      buying:
        'Stock skews older, with land value carrying more weight than building age. Builder-floor reconstructions are the most active segment. Buyers should weigh livability and parking against newer corridors, but the location premium is real.',
    },
  },

  'sector-43': {
    overview: [
      'Sector 43 sits along the Golf Course Road belt with quick access to Cyber Hub and Sushant Lok. It mixes HUDA plotted housing, builder floors and a layer of society apartments — making it one of the more genuinely mixed central Gurgaon sectors.',
      'It draws families and working professionals who want a central address without the price ceiling of Golf Course Road itself.',
    ],
    suits: ['Families', 'Professionals', 'Corporate employees'],
    landscape: [
      {
        kind: 'Builder floors',
        note: '2, 3 and 4 BHK floors across plotted lanes — the most active segment.',
      },
      {
        kind: 'Apartments',
        note: 'Mid-rise society apartments with reasonable amenities and family-led tenancy.',
      },
      {
        kind: 'Plotted houses',
        note: 'Independent residences for owners who want their own house and ground.',
      },
      {
        kind: 'Commercial',
        note: 'Local market pockets and small office formats for neighbourhood-scale businesses.',
      },
    ],
    considerations: {
      rentals:
        'Family-led demand keeps the market steady. Rents sit at a sensible step below Golf Course Road for similar configurations. Society approvals, parking and visitor norms vary across blocks — worth checking before locking in.',
      buying:
        'Builder floors with good light, parking and an honest construction quality command a meaningful premium. Resale is steady; turnaround time depends on configuration and pricing discipline.',
    },
  },

  'sector-52': {
    overview: [
      'Sector 52 is the quieter pocket adjacent to Golf Course Road and Sushant Lok, well-connected by the Rapid Metro spine and arterial roads into Cyber Hub. The stock is a balanced mix of plotted builder floors and society apartments.',
      'It is largely an end-user market, with families and corporate tenants making up the bulk of demand.',
    ],
    suits: ['Families', 'Professionals', 'Corporate employees'],
    landscape: [
      {
        kind: 'Builder floors',
        note: '2 and 3 BHK floors, with newer reconstructions adding to older HUDA stock.',
      },
      {
        kind: 'Apartments',
        note: 'Society apartments in select complexes, useful for families wanting amenities.',
      },
      {
        kind: 'Plotted houses',
        note: 'Independent floors and houses in the inner lanes.',
      },
    ],
    considerations: {
      rentals:
        'Family tenants dominate, so school proximity, parking and society conduct rules tend to matter more than headline rent. Lock-ins of eleven months with one-month notice are standard.',
      buying:
        'Floors with good ventilation, dedicated parking and clean title documentation command a clear premium. The sector tends to hold value well through cycles.',
    },
  },

  'golf-course-road': {
    overview: [
      'Golf Course Road is Gurgaon’s premier high-street corridor — branded residences, hotels, serviced apartments and grade-A retail along a single spine. It is where the city’s luxury inventory is most concentrated.',
      'Demand spans end-users, expat tenants, corporate leases and investors. The address itself does much of the work, but build quality and society management still separate one tower from another.',
    ],
    suits: [
      'Families',
      'Corporate employees',
      'Investors',
      'Airbnb operators',
    ],
    landscape: [
      {
        kind: 'Apartments',
        note: 'High-rise apartments and branded residences across a range of premium configurations.',
      },
      {
        kind: 'Serviced apartments',
        note: 'Short-stay and corporate-ready supply, useful for relocations and Airbnb-style operations where permitted.',
      },
      {
        kind: 'Villas and floors',
        note: 'Limited supply of independent floors and villas in adjacent pockets.',
      },
      {
        kind: 'Commercial',
        note: 'Grade-A offices, premium high-street retail and hospitality along the spine.',
      },
    ],
    considerations: {
      rentals:
        'Tickets sit at the premium end of the city, with strong expat and senior-management demand. Short-stay and Airbnb-style use is feasible only where the society and lease permit it — worth confirming in writing.',
      buying:
        'A blue-chip address with relatively orderly resale. Price movement at the very top is slower than emerging corridors, but exit liquidity tends to be cleaner. Tower, floor, view and management quality are the real variables.',
    },
  },

  'dwarka-expressway': {
    overview: [
      'The Dwarka Expressway corridor — sectors along and adjacent to the Northern Peripheral Road — has shifted from a future-bet to a delivery-stage market, with possessions ramping up across multiple projects.',
      'Connectivity to Delhi via Dwarka, the airport and the upcoming metro spine is the structural story. Supply is heavy and developer-led; choices between projects matter as much as the choice of sector.',
    ],
    suits: ['Families', 'Professionals', 'Investors'],
    landscape: [
      {
        kind: 'Apartments',
        note: 'High-rise apartments dominate — a mix of ready, possession-stage and under-construction inventory.',
      },
      {
        kind: 'Builder floors',
        note: 'Floors in adjacent plotted sectors for buyers who prefer independent stock.',
      },
      {
        kind: 'Plots',
        note: 'Plotted holdings in select sectors for long-horizon investors.',
      },
      {
        kind: 'Commercial',
        note: 'Roadside and sector-level commercial as the residential base builds out.',
      },
    ],
    considerations: {
      rentals:
        'The rental market is deepening as projects deliver. Possession-stage towers offer the freshest stock; tenants should weigh society readiness and commute realities.',
      buying:
        'Developer reputation and possession track record matter more here than in established corridors. Entry pricing remains attractive relative to Golf Course Road, but a careful project-level choice is what makes the buy work.',
    },
  },

  'sohna-road': {
    overview: [
      'The Sohna Road belt runs south from Subhash Chowk towards Sohna town, holding a value-led, end-user-heavy market. Established societies sit alongside newer launches further south.',
      'It is largely a family-led market, with professionals choosing it for the square-footage they get per rupee versus the central corridors.',
    ],
    suits: ['Families', 'Professionals', 'Investors'],
    landscape: [
      {
        kind: 'Apartments',
        note: 'High-rise apartments across mid-to-premium price points, ready and under-construction.',
      },
      {
        kind: 'Builder floors',
        note: 'Floors in adjacent sectors for buyers who prefer independent stock.',
      },
      {
        kind: 'Villas',
        note: 'Low-density villa pockets further south for long-term end-users.',
      },
      {
        kind: 'Commercial',
        note: 'Roadside commercial and neighbourhood retail along the spine.',
      },
    ],
    considerations: {
      rentals:
        'Family tenancy dominates. School proximity, society conduct and the commute pattern into central Gurgaon usually shape the shortlist more than headline rent.',
      buying:
        'Relative value versus Golf Course Road is the core argument. Longer drives in peak hours are the trade-off; build quality, project location within the corridor and society management are the differentiators worth paying for.',
    },
  },
};

export function getLocationGuide(slug: string): LocationGuide | undefined {
  return LOCATION_GUIDES[slug];
}
