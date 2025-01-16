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


const customHelpers = {
  getTlgCustomChannelGroupingSQL,
};

module.exports = {
  customHelpers,
};
