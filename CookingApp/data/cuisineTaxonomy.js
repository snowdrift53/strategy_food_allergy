/**
 * Cuisine Taxonomy - Centralized mappings for cuisine/country/region search
 * Provides stable, expandable mappings for recipe search across local and online sources
 */

(function() {
    'use strict';

    /**
     * Internal normalization helper: lowercases, trims, removes diacritics, collapses whitespace, removes punctuation
     * @param {string} s - String to normalize
     * @returns {string} Normalized string
     */
    function normalize(s) {
        if (!s || typeof s !== 'string') return '';
        return s.trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[^\w\s]/g, '') // Remove punctuation (keep alphanumeric and spaces)
            .replace(/\s+/g, ' ') // Collapse whitespace
            .trim();
    }

    /**
     * Canonical cuisine entities: each entity has a key and all its forms
     * Forms include both noun (country name) and adjective (demonym) variants
     */
    const CANONICAL_ENTITIES = [
        // Europe
        { key: "french", forms: ["france", "french"] },
        { key: "italian", forms: ["italy", "italian"] },
        { key: "spanish", forms: ["spain", "spanish"] },
        { key: "portuguese", forms: ["portugal", "portuguese"] },
        { key: "greek", forms: ["greece", "greek"] },
        { key: "german", forms: ["germany", "german"] },
        { key: "dutch", forms: ["netherlands", "holland", "dutch"] },
        { key: "swiss", forms: ["switzerland", "swiss"] },
        { key: "austrian", forms: ["austria", "austrian"] },
        { key: "belgian", forms: ["belgium", "belgian"] },
        { key: "polish", forms: ["poland", "polish"] },
        { key: "swedish", forms: ["sweden", "swedish"] },
        { key: "norwegian", forms: ["norway", "norwegian"] },
        { key: "danish", forms: ["denmark", "danish"] },
        { key: "finnish", forms: ["finland", "finnish"] },
        { key: "irish", forms: ["ireland", "irish"] },
        { key: "scottish", forms: ["scotland", "scottish"] },
        { key: "english", forms: ["england", "english"] },
        { key: "british", forms: ["uk", "united kingdom", "britain", "british"] },
        { key: "russian", forms: ["russia", "russian"] },
        { key: "ukrainian", forms: ["ukraine", "ukrainian"] },
        
        // Americas
        { key: "american", forms: ["usa", "us", "united states", "american"] },
        { key: "mexican", forms: ["mexico", "mexican"] },
        { key: "canadian", forms: ["canada", "canadian"] },
        { key: "brazilian", forms: ["brazil", "brazilian"] },
        { key: "argentinian", forms: ["argentina", "argentinian"] },
        { key: "chilean", forms: ["chile", "chilean"] },
        { key: "peruvian", forms: ["peru", "peruvian"] },
        { key: "colombian", forms: ["colombia", "colombian"] },
        { key: "venezuelan", forms: ["venezuela", "venezuelan"] },
        
        // Asia
        { key: "chinese", forms: ["china", "chinese"] },
        { key: "japanese", forms: ["japan", "japanese"] },
        { key: "korean", forms: ["korea", "south korea", "korean"] },
        { key: "thai", forms: ["thailand", "thai"] },
        { key: "vietnamese", forms: ["vietnam", "vietnamese"] },
        { key: "indian", forms: ["india", "indian"] },
        { key: "pakistani", forms: ["pakistan", "pakistani"] },
        { key: "indonesian", forms: ["indonesia", "indonesian"] },
        { key: "filipino", forms: ["philippines", "philippine", "filipino"] },
        { key: "malaysian", forms: ["malaysia", "malaysian"] },
        { key: "singaporean", forms: ["singapore", "singaporean"] },
        
        // Middle East & North Africa
        { key: "moroccan", forms: ["morocco", "moroccan"] },
        { key: "tunisian", forms: ["tunisia", "tunisian"] },
        { key: "algerian", forms: ["algeria", "algerian"] },
        { key: "turkish", forms: ["turkey", "turkish"] },
        { key: "egyptian", forms: ["egypt", "egyptian"] },
        
        // Note: Turkey entity uses "turkish" as canonical key (demonym form)
        // Both "turkey" and "turkish" map to the same canonical
        
        // Oceania
        { key: "australian", forms: ["australia", "australian"] },
        { key: "new zealand", forms: ["new zealand", "nz"] }
    ];

    /**
     * Convert entities to CANONICAL_TO_FORMS map for backwards compatibility
     */
    const CANONICAL_TO_FORMS = {};
    CANONICAL_ENTITIES.forEach(entity => {
        CANONICAL_TO_FORMS[entity.key] = entity.forms;
    });

    /**
     * Prefix generation constants
     */
    const MIN_PREFIX = 4;
    const MAX_PREFIX = 10;

    /**
     * Build ALIAS_TO_KEY: exact normalized string -> canonicalKey
     */
    const ALIAS_TO_KEY = {};
    CANONICAL_ENTITIES.forEach(entity => {
        const normalizedKey = normalize(entity.key);
        // Map canonical key to itself
        ALIAS_TO_KEY[normalizedKey] = normalizedKey;
        // Map all forms to canonical key
        entity.forms.forEach(form => {
            const normalizedForm = normalize(form);
            ALIAS_TO_KEY[normalizedForm] = normalizedKey;
        });
    });

    /**
     * Build PREFIX_TO_KEY: prefix -> canonicalKey, but only if unique
     * First collect all prefix -> set(keys), then only keep prefixes that map to exactly one key
     */
    const prefixToKeysMap = {}; // Temporary: prefix -> Set of keys
    CANONICAL_ENTITIES.forEach(entity => {
        const normalizedKey = normalize(entity.key);
        const allForms = [entity.key, ...entity.forms];
        
        allForms.forEach(form => {
            const normalizedForm = normalize(form);
            if (normalizedForm.length >= MIN_PREFIX) {
                // Generate prefixes from MIN_PREFIX up to MAX_PREFIX or form length
                const maxLen = Math.min(MAX_PREFIX, normalizedForm.length);
                for (let len = MIN_PREFIX; len <= maxLen; len++) {
                    const prefix = normalizedForm.substring(0, len);
                    if (!prefixToKeysMap[prefix]) {
                        prefixToKeysMap[prefix] = new Set();
                    }
                    prefixToKeysMap[prefix].add(normalizedKey);
                }
            }
        });
    });

    // Build final PREFIX_TO_KEY: only keep prefixes that map to exactly one key
    const PREFIX_TO_KEY = {};
    for (const [prefix, keysSet] of Object.entries(prefixToKeysMap)) {
        if (keysSet.size === 1) {
            PREFIX_TO_KEY[prefix] = Array.from(keysSet)[0];
        }
    }

    /**
     * Build ALIASES map: maps each form to its canonical key (for backwards compatibility)
     * All keys are normalized
     */
    const ALIASES = ALIAS_TO_KEY; // Reuse the same structure

    /**
     * Country/cuisine name to demonym (area name) mapping
     * Keys and values are normalized (lowercase, no diacritics)
     * @deprecated Use CANONICAL_TO_FORMS and ALIASES instead
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
     * Uses canonical equivalence so country nouns, cuisine adjectives, and safe short prefixes return identical results
     * @param {string} query - Search query
     * @returns {Set<string>} Set of normalized terms to match against
     */
    function expandCuisineQueryTerms(query) {
        if (!query || typeof query !== 'string') {
            return new Set();
        }
        
        const qNorm = normalize(query);
        if (!qNorm) {
            return new Set();
        }
        
        let canonicalKey = null;
        
        // Try EXACT match first
        if (ALIAS_TO_KEY[qNorm]) {
            canonicalKey = ALIAS_TO_KEY[qNorm];
        }
        // Else try UNIQUE PREFIX match (only if query length >= MIN_PREFIX)
        else if (qNorm.length >= MIN_PREFIX && PREFIX_TO_KEY[qNorm]) {
            canonicalKey = PREFIX_TO_KEY[qNorm];
        }
        
        // If key found, return Set of ALL forms for that key + region expansions
        if (canonicalKey && CANONICAL_TO_FORMS[canonicalKey]) {
            const terms = new Set();
            // Add all forms from canonical entity
            CANONICAL_TO_FORMS[canonicalKey].forEach(form => {
                terms.add(normalize(form));
            });
            // Also add the canonical key itself
            terms.add(normalize(canonicalKey));
            
            // Add regional demonyms if query matches a region
            if (REGION_TO_DEMONYMS[qNorm]) {
                REGION_TO_DEMONYMS[qNorm].forEach(demonym => {
                    terms.add(normalize(demonym));
                });
            }
            
            // Check for multi-word patterns like "central europe"
            if (qNorm.includes('europe')) {
                if (qNorm.includes('central')) {
                    if (REGION_TO_DEMONYMS['central europe']) {
                        REGION_TO_DEMONYMS['central europe'].forEach(demonym => {
                            terms.add(normalize(demonym));
                        });
                    }
                }
                if (REGION_TO_DEMONYMS['european']) {
                    REGION_TO_DEMONYMS['european'].forEach(demonym => {
                        terms.add(normalize(demonym));
                    });
                }
            }
            
            return terms;
        }
        
        // If not found, return Set with just normalized query (do not guess)
        return new Set([qNorm]);
    }

    /**
     * Detect TheMealDB area(s) from a query
     * Uses expanded terms from canonical equivalence, preferring adjective forms for TheMealDB mapping
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
        
        // Use expanded terms to get all equivalent forms
        const expandedTerms = expandCuisineQueryTerms(query);
        
        // Check each expanded term for TheMealDB area mapping
        // Prefer adjective forms (demonyms) when checking DEMONYM_TO_THEMEALDB_AREA
        for (const term of expandedTerms) {
            const normalizedTerm = normalize(term);
            
            // Check if term is a canonical key (demonym/adjective form)
            if (CANONICAL_TO_FORMS[normalizedTerm]) {
                // This is a canonical key (demonym), check for TheMealDB area
                const area = DEMONYM_TO_THEMEALDB_AREA[normalizedTerm];
                if (area) {
                    areas.push(area);
                }
            } else {
                // Check if term maps to a canonical key, then check that canonical for area
                const canonicalKey = ALIASES[normalizedTerm];
                if (canonicalKey) {
                    const area = DEMONYM_TO_THEMEALDB_AREA[canonicalKey];
                    if (area) {
                        areas.push(area);
                    }
                }
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
        CANONICAL_ENTITIES: CANONICAL_ENTITIES,
        CANONICAL_TO_FORMS: CANONICAL_TO_FORMS,
        ALIAS_TO_KEY: ALIAS_TO_KEY,
        PREFIX_TO_KEY: PREFIX_TO_KEY,
        ALIASES: ALIASES,
        COUNTRY_TO_DEMONYM: COUNTRY_TO_DEMONYM,
        REGION_TO_DEMONYMS: REGION_TO_DEMONYMS,
        DEMONYM_TO_THEMEALDB_AREA: DEMONYM_TO_THEMEALDB_AREA,
        REGION_TO_THEMEALDB_AREAS: REGION_TO_THEMEALDB_AREAS,
        MIN_PREFIX: MIN_PREFIX,
        MAX_PREFIX: MAX_PREFIX
    };

    window.expandCuisineQueryTerms = expandCuisineQueryTerms;
    window.detectTheMealDbAreasFromQuery = detectTheMealDbAreasFromQuery;

    /* ===== Console Tests =====
    // Uncomment to run tests verifying country noun vs cuisine adjective equivalence and prefix matching:
    
    // Helper function to compare sets
    function setEquals(a, b) {
        if (a.size !== b.size) return false;
        const arrA = Array.from(a).sort();
        const arrB = Array.from(b).sort();
        return JSON.stringify(arrA) === JSON.stringify(arrB);
    }
    
    // Test 1: Programmatic test for each entity - all forms should expand to same set
    (function() {
        let allPassed = true;
        CANONICAL_ENTITIES.forEach(entity => {
            const normalizedKey = normalize(entity.key);
            const baseExpansion = expandCuisineQueryTerms(entity.key);
            entity.forms.forEach(form => {
                const formExpansion = expandCuisineQueryTerms(form);
                if (!setEquals(baseExpansion, formExpansion)) {
                    console.error(`Entity ${entity.key}: form "${form}" expansion mismatch`, {
                        base: Array.from(baseExpansion).sort(),
                        form: Array.from(formExpansion).sort()
                    });
                    allPassed = false;
                }
            });
        });
        if (allPassed) {
            console.log("✓ All entity forms expand to same set");
        }
    })();
    
    // Test 2: Prefix behavior test
    (function() {
        let allPassed = true;
        CANONICAL_ENTITIES.forEach(entity => {
            const normalizedKey = normalize(entity.key);
            const baseExpansion = expandCuisineQueryTerms(entity.key);
            const allForms = [entity.key, ...entity.forms];
            allForms.forEach(form => {
                const normalizedForm = normalize(form);
                if (normalizedForm.length >= MIN_PREFIX) {
                    const prefix = normalizedForm.substring(0, 5); // Test 5-char prefix
                    if (PREFIX_TO_KEY[prefix]) {
                        const prefixExpansion = expandCuisineQueryTerms(prefix);
                        if (!setEquals(baseExpansion, prefixExpansion)) {
                            console.error(`Entity ${entity.key}: prefix "${prefix}" expansion mismatch`, {
                                base: Array.from(baseExpansion).sort(),
                                prefix: Array.from(prefixExpansion).sort()
                            });
                            allPassed = false;
                        }
                    }
                }
            });
        });
        if (allPassed) {
            console.log("✓ All unique prefixes expand to same set as their entity");
        }
    })();
    
    // Test 3: Explicit tests for specific cases
    (function() {
        // Tunisia/Tunisian/Tunis equivalence
        const tunisiaTerms = Array.from(expandCuisineQueryTerms("tunisia")).sort();
        const tunisianTerms = Array.from(expandCuisineQueryTerms("tunisian")).sort();
        const tunisTerms = Array.from(expandCuisineQueryTerms("tunis")).sort();
        console.assert(
            JSON.stringify(tunisiaTerms) === JSON.stringify(tunisianTerms) &&
            JSON.stringify(tunisiaTerms) === JSON.stringify(tunisTerms),
            "Tunisia/Tunisian/Tunis equivalence failed",
            { tunisia: tunisiaTerms, tunisian: tunisianTerms, tunis: tunisTerms }
        );
        console.log("✓ Tunisia/Tunisian/Tunis equivalence test passed");
    })();
    
    (function() {
        // Portugal/Portuguese/Portug equivalence (if unique prefix exists)
        const portugalTerms = Array.from(expandCuisineQueryTerms("portugal")).sort();
        const portugueseTerms = Array.from(expandCuisineQueryTerms("portuguese")).sort();
        console.assert(
            JSON.stringify(portugalTerms) === JSON.stringify(portugueseTerms),
            "Portugal/Portuguese equivalence failed",
            { portugal: portugalTerms, portuguese: portugueseTerms }
        );
        if (PREFIX_TO_KEY["portug"]) {
            const portugTerms = Array.from(expandCuisineQueryTerms("portug")).sort();
            console.assert(
                JSON.stringify(portugalTerms) === JSON.stringify(portugTerms),
                "Portugal/Portuguese/Portug equivalence failed",
                { portugal: portugalTerms, portug: portugTerms }
            );
            console.log("✓ Portugal/Portuguese/Portug equivalence test passed");
        } else {
            console.log("✓ Portugal/Portuguese equivalence test passed (portug prefix not unique, skipped)");
        }
    })();
    
    (function() {
        // Sweden/Swedish/Swed equivalence (if unique prefix exists)
        const swedenTerms = Array.from(expandCuisineQueryTerms("sweden")).sort();
        const swedishTerms = Array.from(expandCuisineQueryTerms("swedish")).sort();
        console.assert(
            JSON.stringify(swedenTerms) === JSON.stringify(swedishTerms),
            "Sweden/Swedish equivalence failed",
            { sweden: swedenTerms, swedish: swedishTerms }
        );
        if (PREFIX_TO_KEY["swed"]) {
            const swedTerms = Array.from(expandCuisineQueryTerms("swed")).sort();
            console.assert(
                JSON.stringify(swedenTerms) === JSON.stringify(swedTerms),
                "Sweden/Swedish/Swed equivalence failed",
                { sweden: swedenTerms, swed: swedTerms }
            );
            console.log("✓ Sweden/Swedish/Swed equivalence test passed");
        } else {
            console.log("✓ Sweden/Swedish equivalence test passed (swed prefix not unique, skipped)");
        }
    })();
    */
})();
