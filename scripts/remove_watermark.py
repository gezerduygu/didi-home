import cv2
import numpy as np
import os
import sys

def remove_gemini_watermark(image_path, output_path=None):
    """
    Erases the Gemini 4-pointed sparkle logo from the bottom-right corner of an image
    using OpenCV Telea inpainting algorithm.
    """
    if not os.path.exists(image_path):
        print(f"Error: File not found: {image_path}")
        return False

    if output_path is None:
        output_path = image_path

    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: Could not read image: {image_path}")
        return False

    h, w, _ = img.shape

    # Gemini watermark is located in the bottom-right corner (approx 50x50px box)
    mask = np.zeros((h, w), dtype=np.uint8)

    # Box bounds: 65px from right/bottom edges to 5px from edge
    box_right = max(0, w - 65)
    box_left = max(0, w - 5)
    box_bottom = max(0, h - 65)
    box_top = max(0, h - 5)

    cv2.rectangle(mask, (box_right, box_bottom), (box_left, box_top), 255, -1)

    # Inpaint the region seamlessly from surrounding pixels
    result = cv2.inpaint(img, mask, inpaintRadius=5, flags=cv2.INPAINT_TELEA)

    cv2.imwrite(output_path, result)
    print(f"Successfully erased Gemini watermark: {image_path} -> {output_path}")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target = sys.argv[1]
        if os.path.isdir(target):
            for file in os.listdir(target):
                if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    remove_gemini_watermark(os.path.join(target, file))
        else:
            remove_gemini_watermark(target)
    else:
        print("Usage: python scripts/remove_watermark.py <path_to_image_or_directory>")
