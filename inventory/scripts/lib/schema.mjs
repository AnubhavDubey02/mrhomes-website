/**
 * schema.mjs
 * Canonical field definitions for the Mr Homes inventory record.
 * All pipeline stages use this module as the single source of truth
 * for field names, ordering, and validation rules.
 */

export const RECORD_VERSION = '1.1';

/** All canonical field names, in display/export order. */
export const MASTER_FIELDS = [
  'MH_ID',
  'Source',
  'Source_Property_Ref',
  'Source_Room_No',
  'Sector',
  'Locality',
  'Property_Type',
  'Rent',
  'Availability_Status',
  'Availability_Date',
  'Furnishing',
  'Floor',
  'Balcony',
  'Lift',
  'Photos',
  'Website_Show',
  'Listing_Status',
  'Duplicate_Check',
  'Review_Status',
  'Notes',
  'Confidence_Score',
  // ── History & traceability fields ──────────────────────────────────────────
  'Change_Type',
  'Created_At',
  'Updated_At',
  'Last_Seen',
  // ── Screenshot / run provenance ────────────────────────────────────────────
  'Screenshot_File',
  'Source_Folder',
  'Processed_At',
  'Extraction_Run_ID',
];

/**
 * Fields safe to expose on the public website / via API.
 * Source identifiers, internal references, and admin notes are excluded.
 */
export const PUBLIC_FIELDS = [
  'Property_Type',
  'Sector',
  'Locality',
  'Rent',
  'Availability_Status',
  'Availability_Date',
  'Furnishing',
  'Floor',
  'Balcony',
  'Lift',
];

/**
 * Core fields — all three must be non-null for a record to be promoted to master.
 * Optional fields (Floor, Furnishing, Balcony, Lift, Photos, Availability) may be
 * null without forcing a record into review; their absence is reflected in the
 * Confidence_Score instead.
 */
export const REQUIRED_FIELDS = [
  'Sector',
  'Property_Type',
  'Rent',
];

/**
 * Scoring weights for Confidence_Score (0–100).
 * A record's score is the sum of weights for each non-null field present.
 */
export const CONFIDENCE_WEIGHTS = {
  Sector:               20,
  Property_Type:        20,
  Rent:                 20,
  Availability_Status:  15,
  Source_Property_Ref:  15,
  Floor:                10,
};
// Total possible: 100

/**
 * Routing tiers based on Confidence_Score.
 *   score >= HIGH  → Review_Status = 'Approved'  → master sheet
 *   score >= LOW   → Review_Status = 'Needs Review'  → review sheet
 *   score <  LOW   → Review_Status = 'Needs Manual Review'  → review sheet
 */
export const CONFIDENCE_TIERS = {
  HIGH: 85,
  LOW:  60,
};

/** Valid values for enumerated fields — used for validation flags. */
export const ENUMS = {
  Availability_Status: ['Immediate', 'Vacating', 'Occupied', 'Unknown'],
  Furnishing:          ['Fully Furnished', 'Fully Furnished & Fitted', 'Semi-Furnished', 'Unfurnished'],
  Listing_Status:      ['Active', 'Draft', 'Inactive'],
  Duplicate_Check:     ['Unique', 'Possible Duplicate', 'Duplicate'],
  Review_Status:       ['Approved', 'Needs Review', 'Needs Manual Review', 'Rejected'],
  Website_Show:        [true, false],
  Change_Type:         ['NEW', 'UPDATED', 'UNCHANGED', 'REMOVED'],
};

/** Returns a blank record with all canonical fields set to null. */
export function blankRecord() {
  return Object.fromEntries(MASTER_FIELDS.map(f => [f, null]));
}

/**
 * Validates a record against required fields and enum constraints.
 * @param {object} record
 * @returns {{ missing: string[], invalid: string[] }}
 */
export function validateRecord(record) {
  const missing = REQUIRED_FIELDS.filter(
    f => record[f] == null || record[f] === '',
  );

  const invalid = Object.entries(ENUMS)
    .filter(([field, allowed]) => {
      const val = record[field];
      return val != null && !allowed.includes(val);
    })
    .map(([field]) => field);

  return { missing, invalid };
}
