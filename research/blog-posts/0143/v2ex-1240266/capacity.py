#!/usr/bin/env python3
"""Illustrative decimal-unit workload calculator; no live measurements or quotes."""
import argparse
import json

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--active-devices', type=int, default=100_000)
p.add_argument('--minutes-per-day', type=float, default=10)
p.add_argument('--mbps', type=float, default=2)
p.add_argument('--retention-days', type=int, default=30)
p.add_argument('--storage-price', type=float, help='quoted currency per GB-month')
p.add_argument('--delivery-gb-month', type=float, default=0)
p.add_argument('--delivery-price', type=float, help='quoted currency per delivered GB')
a = p.parse_args()
for k, v in vars(a).items():
    if v is not None and v < 0:
        p.error(f'{k} must be nonnegative')
daily_gb = a.active_devices * a.minutes_per_day * 60 * a.mbps / 8 / 1000
out = {'assumptions': vars(a), 'decimal_units': True,
       'upload_gb_day': daily_gb,
       'steady_state_original_gb': daily_gb * a.retention_days,
       'excludes': 'requests, replicas, versions, derived media, compute, database, TURN, origin egress, tax and labor'}
if a.storage_price is not None:
    out['steady_state_storage_cost_month'] = out['steady_state_original_gb'] * a.storage_price
if a.delivery_price is not None:
    out['delivery_cost_month'] = a.delivery_gb_month * a.delivery_price
print(json.dumps(out, ensure_ascii=False, indent=2))
