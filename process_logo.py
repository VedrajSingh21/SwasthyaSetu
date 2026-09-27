import os
import shutil
from PIL import Image, ImageOps

def process():
    brain_dir = r'C:\Users\acer\.gemini\antigravity-ide\brain\a332f135-f49f-40c6-b545-4e0e4becd40f'
    raw_logo = os.path.join(brain_dir, 'swasthya_setu_logo_1790529503384.jpg')
    raw_app_icon = os.path.join(brain_dir, 'swasthya_app_icon_1790529530415.jpg')

    logo_dir = os.path.abspath(r'assets\logo')
    os.makedirs(logo_dir, exist_ok=True)
    web_public = os.path.abspath(r'apps\web\public')
    os.makedirs(web_public, exist_ok=True)

    # 1. Load full vector logo
    img = Image.open(raw_logo).convert('RGBA')
    width, height = img.size

    # Convert pure white / near-white background to transparent
    # Smooth thresholding
    datas = img.getdata()
    new_data = []
    for item in datas:
        # If color is close to white (R>240, G>240, B>240)
        r, g, b, a = item
        if r > 242 and g > 242 and b > 242:
            # Linear falloff for anti-aliasing near white
            alpha = int(max(0, 255 - ((r + g + b) / 3 - 242) * (255 / (255 - 242))))
            new_data.append((r, g, b, alpha))
        else:
            new_data.append((r, g, b, 255))

    img_transparent = Image.new('RGBA', img.size)
    img_transparent.putdata(new_data)

    # Save full transparent logo
    full_transparent_path = os.path.join(logo_dir, 'swasthya_setu_logo_transparent.png')
    img_transparent.save(full_transparent_path, 'PNG')
    print(f"Saved: {full_transparent_path}")

    # Also save standard white-bg version
    white_bg_path = os.path.join(logo_dir, 'swasthya_setu_logo_white_bg.png')
    img.save(white_bg_path, 'PNG')

    # 2. Crop emblem only (bridge + cross + ecg)
    # The emblem is located in the upper 60% of the image
    emblem_box = (int(width * 0.12), int(height * 0.20), int(width * 0.88), int(height * 0.60))
    emblem_img = img_transparent.crop(emblem_box)
    emblem_path = os.path.join(logo_dir, 'swasthya_setu_emblem_transparent.png')
    emblem_img.save(emblem_path, 'PNG')
    print(f"Saved: {emblem_path}")

    # 3. Process 3D App Icon
    if os.path.exists(raw_app_icon):
        app_icon = Image.open(raw_app_icon).convert('RGBA')
        app_icon_path = os.path.join(logo_dir, 'swasthya_setu_app_icon.png')
        app_icon.save(app_icon_path, 'PNG')

        # Resize for web icons & favicons
        icon_512 = app_icon.resize((512, 512), Image.Resampling.LANCZOS)
        icon_512.save(os.path.join(web_public, 'app-icon-512.png'), 'PNG')

        icon_192 = app_icon.resize((192, 192), Image.Resampling.LANCZOS)
        icon_192.save(os.path.join(web_public, 'app-icon-192.png'), 'PNG')

        favicon_32 = app_icon.resize((32, 32), Image.Resampling.LANCZOS)
        favicon_32.save(os.path.join(web_public, 'favicon.png'), 'PNG')
        favicon_32.save(os.path.join(web_public, 'favicon.ico'), format='ICO')
        print(f"Web favicons & app icons generated in {web_public}")

    # Copy primary logos to web public
    shutil.copy2(full_transparent_path, os.path.join(web_public, 'swasthya_setu_logo.png'))
    shutil.copy2(emblem_path, os.path.join(web_public, 'swasthya_setu_emblem.png'))

    print("Logo processing completed successfully!")

if __name__ == '__main__':
    process()
