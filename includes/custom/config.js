/*
    This file is part of "GA4 Dataform Package".
    Copyright (C) 2023-2024 Superform Labs <support@ga4dataform.com>
    Artem Korneev, Jules Stuifbergen,
    Johan van de Werken, Krisztián Korpa,
    Simon Breton

*/

// do not remove this line
const { lowerSQL } = require("../core/helpers");

/*
    ga4dataform runs the core model with SQL that can be tweaked with
    configuration settings in this file.

    Below, you will find a sample config file that you can tweak to
    your likings.

    See the documentation for all details.

    There are more configuration settings than in this sample file.
    See core/config.js for all config parameters
*/

// config object should be a valid javascript object


const customConfig = {
  // on a new or full build, this start date will be picked

  GA4_START_DATE: "2024-10-01",

  // custom definitions
  // a very complete list of all recommended and standard event parameters is
  // included in the `event_params` column.
  // If you have custom definitions, add them here and they will appear in 
  // the `events_params_custom` column.

  // all custom_ arrays should be in the form:
  // 
  // { name: "paramname", type: "TYPE", renameTo: "outputcolumnname" }
  //
  // "paramname" will be extracted from the data (event param / user property / item custom dim / url parameter)
  // TYPE will be the column type.
  // - "int" -> look for int_value, store as INT
  // - "string" -> look for all values, store as STRING
  // - "decimal" -> look for all numerical values, store as FLOAT
  // options:
  // - "renameTo" -> name the output column to this name. Default: "paramname" will be used
  // cleaningMethod: lowerSQL -> transform the output (of strings) to lower case
 
  // event dimensions and metrics
  // example:
  // CUSTOM_EVENT_PARAMS_ARRAY: [
  //    { name: "event_value", type: "decimal" },
  //    { name: "event_value", type: "string", renameTo: "event_value_string" }
  // ],
  CUSTOM_EVENT_PARAMS_ARRAY: [
    { name: "shipping_country", type: "string" },
    { name: "website_language", type: "string" },
    { name: "page_type", type: "string" },
    { name: "list_category_id", type: "string" },
    { name: "list_category_name", type: "string" }
  ],

  // map here the custom event params to be added in session tables - first param in session
  CUSTOM_EVENT_PARAMS_ARRAY_IN_SESSIONS_FIRST: [
    { name: "shipping_country", type: "string" }
  ],

  // map here the custom event params to be added in session tables - last param in session
  CUSTOM_EVENT_PARAMS_ARRAY_IN_SESSIONS_LAST: [
    { name: "shipping_country", type: "string" }
  ],
  
  // item custom dimensions and metrics
  // these will appear in `items.item_params_custom.*`
  // example:
  // CUSTOM_ITEM_PARAMS_ARRAY: [
  //    { name: "stock_status", type: "string" }
  // ]
  CUSTOM_ITEM_PARAMS_ARRAY : [
    { name: "category_id", type: "string" },
    { name: "category_name", type: "string" },
    { name: "variation_id", type: "string" },
    { name: "size", type: "string" },
    { name: "season", type: "string" }
  ],

  // user properties
  // example:
  // CUSTOM_USER_PROPERTIES_ARRAY: [
  //    { name: "lifetime_value",   type: "decimal" }
  // ],
  CUSTOM_USER_PROPERTIES_ARRAY: [],

  // Examples based on internal search engine params:
  //   CUSTOM_URL_PARAMS_ARRAY: [
  //      { name: "q", cleaningMethod: lowerSQL },
  //      { name: "s", cleaningMethod: lowerSQL },
  //      { name: "search",cleaningMethod: lowerSQL }
  //   ],
  CUSTOM_URL_PARAMS_ARRAY: [],

  // filters
  // array: list the event names you want to exclude from the events table 
  EVENTS_TO_EXCLUDE: [],
  // arrays: list the hostnames you want to exclude (or include) from the events table
  HOSTNAME_EXCLUDE: [],
  HOSTNAME_INCLUDE_ONLY: [],

  CLICK_IDS_ARRAY: [
  // how to classify click ids (from collected_traffic_source) when there is no source/medium/campaign found?

  // name: from collected_traffic_source
  // medium and campaign: fill in with this value when needed (meaning: when found to be organic/referral)
  // note: we never overwrite MEDIUM, CAMPAIGN if explitly set. We only overwrite when campaign is "(organic)", "(referral)" or NULL
  {name:'gclid', source:"google", medium:"cpc", campaign: "(not set)", sources:["url","collected_traffic_source"] },
  {name:'dclid', source:"google", medium:"cpc", campaign: "(not set)", sources:["url","collected_traffic_source"] },

      // temporarily remove srsltid due to Google appending the param also to Organic Search results.
      //   {name:'srsltid', source:"google", medium:"organic", campaign: "Shopping Free Listings", sources:["url","collected_traffic_source"] }, 
      
  {name:'gbraid', source:"google",  medium:"cpc", campaign: "(not set)", sources:["url"]},
  {name:'wbraid', source:"google",  medium:"cpc", campaign: "(not set)", sources:["url"] },
  {name:'msclkid', source:"bing", medium:"cpc", campaign: "(not set)", sources:["url"] }
  ],

  // attribution
  // if a visitors lands on your site without a source, we look back to
  // find a previous session of this user with a source. How many days?
  LAST_NON_DIRECT_LOOKBACK_DAYS: 90,

  // assertions and quality checks can be toggled on (true) or off (false) here
  // quality checks can be toggled off by changing to false

  // assertions
  // id uniqueness checks
  ASSERTIONS_EVENT_ID_UNIQUENESS: true,
  ASSERTIONS_SESSION_ID_UNIQUENESS: true,

  // check for session durations and events look valid?
  ASSERTIONS_SESSION_DURATION_VALIDITY: true,
  ASSERTIONS_SESSIONS_VALIDITY: true, 
  // check GA4 tables: are they on time?
  ASSERTIONS_TABLES_TIMELINESS: true,
  // check for a transaction IDs on a purchase?
  ASSERTIONS_TRANSACTION_ID_COMPLETENESS: false,
  // check for cookies on all hits? (note: cookieless pings will trigger a fail)
  ASSERTIONS_USER_PSEUDO_ID_COMPLETENESS: false

}



module.exports = {
    customConfig
};
