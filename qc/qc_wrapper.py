#!/usr/bin/env python3
# qc_wrapper.py
# This wrapper is intended to be invoked with a single argument: the S3 key to the image.
# It will download the image from S3 using boto3 (env credentials) and run qc_check.py on the local file.
# Output: JSON to stdout with keys: width, height, qc_status, qc_notes

import sys
import os
import json
import tempfile
import boto3
from qc_check import check_image

if len(sys.argv) < 2:
    print(json.dumps({"error":"missing s3 key"}))
    sys.exit(1)

s3_key = sys.argv[1]
bucket = os.environ.get("S3_BUCKET")
if not bucket:
    print(json.dumps({"error":"S3_BUCKET not set"}))
    sys.exit(1)

s3 = boto3.client("s3",
                  aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
                  aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
                  region_name=os.environ.get("S3_REGION"))

tmp = tempfile.NamedTemporaryFile(delete=False)
local_path = tmp.name
tmp.close()

try:
    s3.download_file(bucket, s3_key, local_path)
except Exception as e:
    print(json.dumps({"error":"s3 download failed", "detail":str(e)}))
    sys.exit(2)

# Run qc_check on the file
try:
    # Using default targets; you could extend to pass product size
    res = check_image(local_path, target_print_width_in=6, target_print_height_in=4, target_dpi=300)
    qc_notes = res.get("qc", [])
    qc_status = "pass"
    for n in qc_notes:
        if n.startswith("FAIL"):
            qc_status = "fail"
            break
        if n.startswith("WARN") and qc_status != "fail":
            qc_status = "warn"
    out = {
        "width": res.get("width_px"),
        "height": res.get("height_px"),
        "qc_status": qc_status,
        "qc_notes": qc_notes
    }
    print(json.dumps(out))
    sys.exit(0)
except Exception as e:
    print(json.dumps({"error":"qc failed", "detail":str(e)}))
    sys.exit(3)
finally:
    try:
        os.unlink(local_path)
    except Exception:
        pass
