# AvtoVİP.az — external open-data notices

AvtoVİP.az loads large reference datasets lazily so the GitHub Pages bundle stays small.

## Geographic data
Runtime source: `srestre/world-countries-cities-db`, derived from `dr5hn/countries-states-cities-database` and Yerikmiller data. Country/state/city data is ODbL 1.0. AvtoVİP requests only the selected country instead of shipping the full world database.

## Vehicle reference data
Runtime source: `milpa-cloud/open-vehicle-db`. Data is CC BY 4.0 and tooling is MIT. The UI keeps local fallback makes so core forms still work if the CDN is unavailable.

These datasets are reference/autocomplete sources. User-created listing data remains in the AvtoVİP Supabase project.
