#!/usr/bin/env python3
import json
from collections import Counter

with open('app/data/tests/gooseduck.json') as f:
    d = json.load(f)
print(f"gooseduck.json: version={d.get('version')}, count={d.get('question_count')}, actual={len(d['questions'])}")

q0 = d['questions'][0]
print(f"Q1 options: {list(q0['options'].keys())}")
opt = list(q0['options'].values())[0]
print(f"Option structure: {list(opt.keys())}")

modules = Counter()
for q in d['questions']:
    for opt in q['options'].values():
        modules[opt['module']] += 1
print("Module distribution:")
for m, c in sorted(modules.items()):
    print(f"  {m}: {c}")

with open('app/data/role.json') as f:
    r = json.load(f)
print(f"\nrole.json: {len(r['roles'])} roles")
print(f"  weights keys: {list(r['roles'][0]['weights'].keys())}")

with open('app/data/persona.json') as f:
    p = json.load(f)
print(f"persona.json: {len(p['roles'])} roles")
print(f"  persona keys: {list(p['roles'][0]['persona'].keys())}")

# Check role keys match between role.json and persona.json
role_keys = set(x['key'] for x in r['roles'])
persona_keys = set(x['key'] for x in p['roles'])
print(f"\nRole keys match: {role_keys == persona_keys}")
if role_keys - persona_keys:
    print(f"  In role but not persona: {role_keys - persona_keys}")
if persona_keys - role_keys:
    print(f"  In persona but not role: {persona_keys - role_keys}")
