# qc_check.py
# Requires: pip install opencv-python pillow numpy boto3
from PIL import Image
import cv2
import numpy as np

def variance_of_laplacian(image_gray):
    return cv2.Laplacian(image_gray, cv2.CV_64F).var()

def check_image(path, target_print_width_in=6, target_print_height_in=4, target_dpi=300):
    img = Image.open(path)
    width, height = img.size  # pixels

    # printable size at target DPI
    printable_w = width / target_dpi
    printable_h = height / target_dpi

    # prepare grayscale for sharpness
    open_cv_image = np.array(img.convert('L'))
    lap_var = variance_of_laplacian(open_cv_image)

    results = {
        "path": path,
        "format": img.format,
        "width_px": width,
        "height_px": height,
        "printable_in": (printable_w, printable_h),
        "sharpness_variance": float(lap_var),
        "qc": []
    }

    # Basic checks
    if width < 600 or height < 600:
        results["qc"].append("FAIL: image dimensions too small (<600px)")

    # DPI-based check vs target print size
    if printable_w < target_print_width_in or printable_h < target_print_height_in:
        results["qc"].append("WARN: resolution lower than target print size at 300 DPI")

    # sharpness thresholds (tune for your dataset)
    if lap_var < 100:
        results["qc"].append("FAIL: image appears blurry (low sharpness)")
    elif lap_var < 200:
        results["qc"].append("WARN: image may be slightly soft")

    if img.mode not in ("RGB", "RGBA", "L"):
        results["qc"].append(f"WARN: color mode is {img.mode}, consider converting to sRGB")

    return results
