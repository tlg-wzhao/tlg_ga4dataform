/**
 * Generates SQL for a CASE statement to determine the channel grouping based on provided parameters. This logic represents the default channel grouping logic in GA4.
 * @param {Object} custom_config - Custom configuration object
 * @param {string} source - Source column name
 * @param {string} medium - Medium column name
 * @param {string} campaign - Campaign column name
 * @param {string} category - Category column name
 * @param {string} term - Term column name
 * @param {string} content - Content column name
 * @param {string} campaign_id - Campaign ID column name
 * @returns {string} SQL fragment for CASE statement creation
 */
const getTlgCustomChannelGroupingSQL = (
  custom_config,
  source,
  medium,
  campaign,
  category,
  term,
  content,
  campaign_id,
  brand
) => {
  return `

      -- begin TLG SEM custom mapping

      when
        ${category} = 'SOURCE_CATEGORY_SEARCH'
        and regexp_contains(${medium}, r"^(.*cp.*|ppc|retargeting|paid.*)$")
      then
          case
              when
                regexp_contains(lower(${campaign}), r"^(.*pmax.*)$")
                then 'SEM-Shopping'

              when
                regexp_contains(lower(${campaign}), r"^(.*pure.*)$")
                then 'SEM-Pure'

              when
                regexp_contains(lower(${campaign}), r"^(.*shopping.*)$")
                then 'SEM-Shopping'

              when
                regexp_contains(lower(${campaign}), r"^(.*hybrid.*)$")
                then 'SEM-Hybrid'

              when not
                regexp_contains(lower(${campaign}), r"^(.*video.*)$")
                then 'SEM-Search'
          end

      -- end TLG SEM custom mapping


      -- begin TLG brand-level custom mapping. Reminder to configure the correct brand code in workflow_settings.yaml.
  
       when '${brand}' = 'LN'
        and regexp_contains(${source}, r".*emarsy.*")
       then 'CRM'

       when '${brand}' = 'LN'
        and (
          (
            coalesce(${source}, ${medium}, ${campaign}, ${term}, ${content}, ${campaign_id}) is null
            ) or (
            ${source} = 'direct'
            and (${medium} = '(none)' or ${medium} = '(not set)')
          )
        )
        and (geo.country = 'South Korea' or event_params_custom_first.shipping_country = 'KR' or event_params_custom_last.shipping_country = 'KR') -- South Korea IP or shipping country destination
       then 'Direct - South Korea'

       when '${brand}' = 'BB'
        and (regexp_contains(${source}, r".*email.*") and regexp_contains(${medium}, r".*journeys.*"))
       then 'CRM'

      -- end TLG brand-level custom mapping
      

      -- begin TLG general custom mapping

      when ${source} = 'mapp' 
        or ${source} = 'barilliance' 
        or ${source} = 'emarsys'
        or regexp_contains(${source}, r".*charles.*") or ${medium} = 'whatsapp'

        or regexp_contains(${medium}, r"^(emarsys|mapp|triggered|crm)$")
        then 'Email'

      when ${source} = 'criteo' 
        or ${source} = 'rtbhouse' 
        then 'Retargeting'
      
      when ${source} = 'outbrain' 
        then 'Display'

      when ${medium} = 'aff' 
        then 'Affiliates'

      when ${source} = 'social' 
        then 'Organic Social'

      when ${source} = 'brooksbrothers.com' and ${medium} = 'redirect'
        then 'US Website'

      -- end TLG general custom mapping

  `;
};


/**
 * Given an array of parameter objects like:
 *    [ { name: "shipping_country", type: "string" }, { name: "another_param", type: "int" } ],
 * this function returns a STRUCT(...) block of ARRAY_AGG(...) calls,
 * each referencing the param's name.
 *
 * @param {Array} paramsArray - E.g. [ { name: "shipping_country", type: "string" }, ...]
 * @param {string} [prefix="page."] - e.g. "page." or "event_params."
 * @param {boolean} [orderTypeAsc=true] - Whether to order ascending or descending
 * @param {string} [orderBy="time.event_timestamp_utc"] - Column to ORDER BY
 * @returns {string} A single SQL snippet containing STRUCT( ARRAY_AGG(...) AS ..., ...)
 */
function generateMultiParamAggStruct(
  paramsArray,
  prefix = "event_params_custom.",
  orderTypeAsc = true,
  orderBy = "time.event_timestamp_utc"
) {
  // If there's nothing in the array, return an empty STRUCT
  if (!Array.isArray(paramsArray) || paramsArray.length === 0) {
    return "STRUCT()";
  }

  // Build an ARRAY_AGG(...) line for each param in the array
  const aggLines = paramsArray.map(paramObj => {
    // paramObj.name => e.g. "shipping_country"
    // We'll form something like: ARRAY_AGG(page.shipping_country IGNORE NULLS ORDER BY time.event_timestamp_utc ASC LIMIT 1)[SAFE_OFFSET(0)] AS shipping_country

    const paramRef = `${prefix}${paramObj.name}`; // e.g. "event_params_custom.shipping_country"
    return `
      ARRAY_AGG(${paramRef} IGNORE NULLS ORDER BY ${orderBy} ${
      orderTypeAsc ? "ASC" : "DESC"
    } LIMIT 1)[SAFE_OFFSET(0)] AS ${paramObj.name}
    `.trim();
  });

  // Join them into a single STRUCT
  return `
STRUCT(
  ${aggLines.join(",\n  ")}
)
  `.trim();
}


const customHelpers = {
  getTlgCustomChannelGroupingSQL,
  generateMultiParamAggStruct,
};

module.exports = {
  customHelpers,
};
