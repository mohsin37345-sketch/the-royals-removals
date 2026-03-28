import json
import os

data_dir = os.path.join(os.path.dirname(__file__), 'data')
areas_file = os.path.join(data_dir, 'areas.json')

with open(areas_file, 'r', encoding='utf-8') as f:
    old_areas = json.load(f)

# Old region mapping
old_regions = {r["slug"]: r for r in old_areas}
old_children = {}
for r in old_areas:
    for c in r.get("children", []):
        old_children[c["slug"]] = c

def to_title(slug):
    return ' '.join(word.capitalize() for word in slug.split('-'))

regions_spec = [
    ("birmingham", ["aston", "acocks-green", "alum-rock", "balsall-heath", "bartley-green", "bearwood", "billesley", "bordesley", "bordesley-green", "bournville", "brandwood", "castle-bromwich", "cotteridge", "digbeth", "edgbaston", "erdington", "falcon-lodge", "garretts-green", "great-barr", "handsworth", "handsworth-wood", "harborne", "hodge-hill", "kings-heath", "kings-norton", "ladywood", "lozells", "longbridge", "moseley", "nechells", "northfield", "perry-barr", "quinton", "rubery", "selly-oak", "sheldon", "small-heath", "sparkbrook", "sparkhill", "stechford", "stirchley", "sutton-coldfield", "tyseley", "ward-end", "yardley", "yardley-wood"]),
    ("dudley", ["dudley", "brierley-hill", "sedgley", "gornal", "kingswinford", "wall-heath", "stourbridge", "amblecote", "brockmoor", "lye", "quarry-bank", "netherton", "coseley", "pensnett", "woodside", "halesowen"]),
    ("sandwell", ["west-bromwich", "oldbury", "smethwick", "tipton", "rowley-regis", "wednesbury", "blackheath", "cradley-heath", "tividale", "langley"]),
    ("walsall", ["walsall", "bloxwich", "brownhills", "aldridge", "willenhall", "darlaston", "pelsall", "streetly", "rushall", "shelfield", "leamore", "blakenall", "birchills"]),
    ("wolverhampton", ["wolverhampton", "bilston", "wednesfield", "tettenhall", "penn", "whitmore-reans", "bushbury", "fallings-park", "finchfield", "oxley", "ettingshall", "parkfields"]),
    ("solihull", ["solihull", "shirley", "knowle", "dorridge", "balsall-common", "chelmsley-wood", "marston-green", "olton", "hockley-heath", "dickens-heath", "smiths-wood"]),
    ("coventry", ["coventry", "binley", "tile-hill", "earlsdon", "foleshill", "radford", "stoke", "wyken", "canley", "walsgrave", "allesley", "coundon", "cheylesmore", "bell-green", "longford"]),
    ("lichfield", ["lichfield", "boley-park", "darwin-park", "leomansley", "nether-stowe", "stowe", "streethay", "curborough", "sandfields", "huddlesford", "wall", "burntwood", "armitage", "handsacre", "whittington", "shenstone", "fazeley", "alrewas", "fradley", "hammerwich", "little-aston", "swinfen", "elford", "edingale", "clifton-campville"]),
    ("redditch", ["redditch", "abbeydale", "astwood-bank", "batchley", "church-hill", "crabbs-cross", "enfield", "greenlands", "headless-cross", "lodge-park", "matchborough", "moons-moat", "oakenshaw", "southcrest", "walkwood", "winyates", "woodrow", "alvechurch", "studley", "bromsgrove", "droitwich-spa", "alcester"])
]

# Note: great-barr was removed from sandwell and left in birmingham. 
# castle-bromwich was removed from solihull and left in birmingham.
# Added halesowen to dudley (it was in prompt's Known keyword list but missing from child areas list).

known_keywords = {
    "solihull": {"p": "removals solihull", "s": ["moving company solihull", "removal firms solihull", "removal company solihull"]},
    "sutton-coldfield": {"p": "removals sutton coldfield", "s": ["removal companies sutton coldfield", "movers sutton coldfield", "removal firms sutton coldfield", "storage sutton coldfield", "man and van sutton coldfield"]},
    "walsall": {"p": "removals walsall", "s": ["man with a van walsall", "walsall removals", "house removals walsall", "moving company walsall"]},
    "halesowen": {"p": "removals halesowen", "s": ["removal companies halesowen"]}
}

new_areas = []
seen_slugs = set()

for region_slug, child_slugs in regions_spec:
    old_reg = old_regions.get(region_slug, {})
    name = to_title(region_slug)
    
    reg_obj = {
        "slug": region_slug,
        "name": old_reg.get("name", name),
        "h1": old_reg.get("h1", f"Removals in {name}"),
        "metaTitle": old_reg.get("metaTitle", f"Removals {name} | Trusted Movers | The Royals Removals"),
        "metaDescription": old_reg.get("metaDescription", f"Professional removal services in {name}. careful and insured moves across {name}."),
        "primaryKeyword": known_keywords.get(region_slug, {}).get("p", old_reg.get("primaryKeyword", f"removals {name.lower()}")),
        "secondaryKeywords": known_keywords.get(region_slug, {}).get("s", old_reg.get("secondaryKeywords", [f"{name.lower()} removals", f"movers {name.lower()}"])),
        "intro": old_reg.get("intro", f"{name} is a vibrant area with excellent properties. The Royals Removals provides reliable, professional moving services throughout {name} and surrounding areas."),
        "children": []
    }
    
    for c_slug in child_slugs:
        if c_slug in seen_slugs: continue
        seen_slugs.add(c_slug)
        
        c_name = to_title(c_slug)
        old_c = old_children.get(c_slug, {})
        
        p_kw = "BLANK"
        s_kw = ["BLANK"]
        
        if c_slug in known_keywords:
            p_kw = known_keywords[c_slug]["p"]
            s_kw = known_keywords[c_slug]["s"]
        elif old_c:
            p_kw = old_c.get("primaryKeyword", "BLANK")
            s_kw = old_c.get("secondaryKeywords", ["BLANK"])
            
        c_obj = {
            "slug": c_slug,
            "name": old_c.get("name", c_name),
            "primaryKeyword": p_kw,
            "secondaryKeywords": s_kw,
            "nearbyAreas": old_c.get("nearbyAreas", [])
        }
        reg_obj["children"].append(c_obj)
        
    new_areas.append(reg_obj)

with open(areas_file, 'w', encoding='utf-8') as f:
    json.dump(new_areas, f, indent=2)

print("areas.json updated successfully.")
