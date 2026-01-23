/**
 * Cuisine Taxonomy - Centralized mappings for cuisine/country/region search
 * Provides stable, expandable mappings for recipe search across local and online sources
 */

(function() {
    'use strict';

    /**
     * Internal normalization helper: lowercases, trims, removes diacritics
     * @param {string} s - String to normalize
     * @returns {string} Normalized string
     */
    function normalize(s) {
        if (!s || typeof s !== 'string') return '';
        return s.trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Country/cuisine name to demonym (area name) mapping
     * Keys and values are normalized (lowercase, no diacritics)
     */
    const COUNTRY_TO_DEMONYM = {
        // Europe
        "france": "french",
        "french": "french",
        "italy": "italian",
        "italian": "italian",
        "spain": "spanish",
        "spanish": "spanish",
        "portugal": "portuguese",
        "portuguese": "portuguese",
        "greece": "greek",
        "greek": "greek",
        "germany": "german",
        "german": "german",
        "netherlands": "dutch",
        "dutch": "dutch",
        "holland": "dutch",
        "switzerland": "swiss",
        "swiss": "swiss",
        "austria": "austrian",
        "austrian": "austrian",
        "belgium": "belgian",
        "belgian": "belgian",
        "poland": "polish",
        "polish": "polish",
        "sweden": "swedish",
        "swedish": "swedish",
        "norway": "norwegian",
        "norwegian": "norwegian",
        "denmark": "danish",
        "danish": "danish",
        "finland": "finnish",
        "finnish": "finnish",
        "ireland": "irish",
        "irish": "irish",
        "scotland": "scottish",
        "scottish": "scottish",
        "england": "english",
        "english": "english",
        "uk": "british",
        "united kingdom": "british",
        "britain": "british",
        "british": "british",
        "russia": "russian",
        "russian": "russian",
        "ukraine": "ukrainian",
        "ukrainian": "ukrainian",
        
        // Americas
        "usa": "american",
        "us": "american",
        "united states": "american",
        "american": "american",
        "mexico": "mexican",
        "mexican": "mexican",
        "canada": "canadian",
        "canadian": "canadian",
        "brazil": "brazilian",
        "brazilian": "brazilian",
        "argentina": "argentinian",
        "argentinian": "argentinian",
        "chile": "chilean",
        "chilean": "chilean",
        "peru": "peruvian",
        "peruvian": "peruvian",
        "colombia": "colombian",
        "colombian": "colombian",
        "venezuela": "venezuelan",
        "venezuelan": "venezuelan",
        
        // Asia
        "china": "chinese",
        "chinese": "chinese",
        "japan": "japanese",
        "japanese": "japanese",
        "korea": "korean",
        "south korea": "korean",
        "korean": "korean",
        "thailand": "thai",
        "thai": "thai",
        "vietnam": "vietnamese",
        "vietnamese": "vietnamese",
        "india": "indian",
        "indian": "indian",
        "pakistan": "pakistani",
        "pakistani": "pakistani",
        "indonesia": "indonesian",
        "indonesian": "indonesian",
        "philippines": "filipino",
        "philippine": "filipino",
        "filipino": "filipino",
        "malaysia": "malaysian",
        "malaysian": "malaysian",
        "singapore": "singaporean",
        "singaporean": "singaporean",
        
        // Middle East & North Africa
        "morocco": "moroccan",
        "moroccan": "moroccan",
        "tunisia": "tunisian",
        "tunisian": "tunisian",
        "algeria": "algerian",
        "algerian": "algerian",
        "turkey": "turkish",
        "turkish": "turkish",
        
        // Oceania
        "australia": "australian",
        "australian": "australian",
        "new zealand": "new zealand",
        "nz": "new zealand"
    };

    /**
     * Regional keywords to list of demonyms (normalized)
     */
    const REGION_TO_DEMONYMS = {
        // Asian regions
        "asia": ["chinese", "japanese", "korean", "thai", "vietnamese", "indian", "malaysian", "indonesian", "filipino"],
        "asian": ["chinese", "japanese", "korean", "thai", "vietnamese", "indian", "malaysian", "indonesian", "filipino"],
        "east asian": ["chinese", "japanese", "korean"],
        "southeast asian": ["thai", "vietnamese", "malaysian", "indonesian", "filipino"],
        "south asian": ["indian", "pakistani"],
        
        // Mediterranean & Middle East
        "mediterranean": ["greek", "italian", "spanish", "portuguese", "turkish", "moroccan", "tunisian", "algerian"],
        "north africa": ["moroccan", "tunisian", "algerian"],
        "north african": ["moroccan", "tunisian", "algerian"],
        "maghreb": ["moroccan", "tunisian", "algerian"],
        "middle east": ["turkish"],
        "middle eastern": ["turkish"],
        
        // Latin America
        "latin america": ["mexican", "peruvian", "colombian", "venezuelan", "chilean", "argentinian", "brazilian"],
        "latin american": ["mexican", "peruvian", "colombian", "venezuelan", "chilean", "argentinian", "brazilian"],
        "south america": ["peruvian", "colombian", "venezuelan", "chilean", "argentinian", "brazilian"],
        
        // European regions
        "europe": ["french", "italian", "spanish", "portuguese", "greek", "dutch", "german", "polish", "swedish", "norwegian", "danish", "finnish", "british", "irish", "scottish", "english", "russian", "ukrainian", "austrian", "swiss", "belgian"],
        "european": ["french", "italian", "spanish", "portuguese", "greek", "dutch", "german", "polish", "swedish", "norwegian", "danish", "finnish", "british", "irish", "scottish", "english", "russian", "ukrainian", "austrian", "swiss", "belgian"],
        "central europe": ["german", "austrian", "swiss", "polish"],
        "central european": ["german", "austrian", "swiss", "polish"]
    };

    /**
     * Demonym to TheMealDB area string mapping
     * Maps normalized demonyms to TheMealDB API area names (case-sensitive as required by API)
     */
    const DEMONYM_TO_THEMEALDB_AREA = {
        "italian": "Italian",
        "spanish": "Spanish",
        "mexican": "Mexican",
        "indian": "Indian",
        "chinese": "Chinese",
        "japanese": "Japanese",
        "korean": "Korean",
        "thai": "Thai",
        "french": "French",
        "british": "British",
        "canadian": "Canadian",
        "american": "American",
        "greek": "Greek",
        "portuguese": "Portuguese",
        "dutch": "Dutch",
        "german": "German",
        "polish": "Polish",
        "swedish": "Swedish",
        "norwegian": "Norwegian",
        "danish": "Danish",
        "finnish": "Finnish",
        "irish": "Irish",
        "russian": "Russian",
        "ukrainian": "Ukrainian",
        "turkish": "Turkish",
        "moroccan": "Moroccan",
        "tunisian": "Tunisian",
        "algerian": "Algerian",
        "vietnamese": "Vietnamese",
        "filipino": "Filipino",
        "malaysian": "Malaysian",
        "indonesian": "Indonesian",
        "brazilian": "Brazilian",
        "peruvian": "Peruvian",
        "colombian": "Colombian",
        "chilean": "Chilean",
        "argentinian": "Argentinian",
        "venezuelan": "Venezuelan",
        "australian": "Australian"
    };

    /**
     * Region to TheMealDB areas (derived from REGION_TO_DEMONYMS and DEMONYM_TO_THEMEALDB_AREA)
     */
    const REGION_TO_THEMEALDB_AREAS = {};
    for (const [region, demonyms] of Object.entries(REGION_TO_DEMONYMS)) {
        const areas = demonyms
            .map(d => DEMONYM_TO_THEMEALDB_AREA[d])
            .filter(a => a); // Remove undefined
        if (areas.length > 0) {
            REGION_TO_THEMEALDB_AREAS[region] = areas;
        }
    }

    /**
     * Expand a query into a set of normalized search terms
     * @param {string} query - Search query
     * @returns {Set<string>} Set of normalized terms to match against
     */
    function expandCuisineQueryTerms(query) {
        if (!query || typeof query !== 'string') {
            return new Set();
        }
        
        const q = normalize(query);
        if (!q) {
            return new Set();
        }
        
        const terms = new Set([q]);
        
        // Add demonym if query is a country/cuisine word
        if (COUNTRY_TO_DEMONYM[q]) {
            terms.add(COUNTRY_TO_DEMONYM[q]);
        }
        
        // Add regional demonyms if query matches a region
        if (REGION_TO_DEMONYMS[q]) {
            REGION_TO_DEMONYMS[q].forEach(demonym => {
                terms.add(normalize(demonym));
            });
        }
        
        // Check for multi-word patterns like "central europe"
        // First check full normalized string, then check if it includes "europe"
        const normalizedQuery = q;
        if (normalizedQuery.includes('europe')) {
            // Check for "central europe" / "central european"
            if (normalizedQuery.includes('central')) {
                if (REGION_TO_DEMONYMS['central europe']) {
                    REGION_TO_DEMONYMS['central europe'].forEach(demonym => {
                        terms.add(normalize(demonym));
                    });
                }
            }
            // Also add general european demonyms
            if (REGION_TO_DEMONYMS['european']) {
                REGION_TO_DEMONYMS['european'].forEach(demonym => {
                    terms.add(normalize(demonym));
                });
            }
        }
        
        return terms;
    }

    /**
     * Detect TheMealDB area(s) from a query
     * @param {string} query - Search query
     * @returns {null|string|string[]} Single area string, array of areas, or null
     */
    function detectTheMealDbAreasFromQuery(query) {
        if (!query || typeof query !== 'string') {
            return null;
        }
        
        const q = normalize(query);
        if (!q) {
            return null;
        }
        
        const areas = [];
        
        // Check if query maps to a single demonym -> area
        if (COUNTRY_TO_DEMONYM[q]) {
            const demonym = COUNTRY_TO_DEMONYM[q];
            const area = DEMONYM_TO_THEMEALDB_AREA[demonym];
            if (area) {
                areas.push(area);
            }
        }
        
        // Check if query matches a region
        if (REGION_TO_THEMEALDB_AREAS[q]) {
            areas.push(...REGION_TO_THEMEALDB_AREAS[q]);
        }
        
        // Check for multi-word patterns
        const normalizedQuery = q;
        if (normalizedQuery.includes('europe')) {
            if (normalizedQuery.includes('central')) {
                if (REGION_TO_THEMEALDB_AREAS['central europe']) {
                    areas.push(...REGION_TO_THEMEALDB_AREAS['central europe']);
                }
            }
            if (REGION_TO_THEMEALDB_AREAS['european']) {
                areas.push(...REGION_TO_THEMEALDB_AREAS['european']);
            }
        }
        
        // Remove duplicates
        const uniqueAreas = Array.from(new Set(areas));
        
        if (uniqueAreas.length === 0) {
            return null;
        } else if (uniqueAreas.length === 1) {
            return uniqueAreas[0];
        } else {
            return uniqueAreas;
        }
    }

    // Expose on window
    window.CUISINE_TAXONOMY = {
        normalize: normalize,
        COUNTRY_TO_DEMONYM: COUNTRY_TO_DEMONYM,
        REGION_TO_DEMONYMS: REGION_TO_DEMONYMS,
        DEMONYM_TO_THEMEALDB_AREA: DEMONYM_TO_THEMEALDB_AREA,
        REGION_TO_THEMEALDB_AREAS: REGION_TO_THEMEALDB_AREAS
    };

    window.expandCuisineQueryTerms = expandCuisineQueryTerms;
    window.detectTheMealDbAreasFromQuery = detectTheMealDbAreasFromQuery;
})();
