# PWA Icons

This directory should contain your app icons in various sizes for Progressive Web App (PWA) support.

## Required Icon Sizes

Generate the following icon sizes from your app logo:

- `icon-72x72.png` - Small devices
- `icon-96x96.png` - Standard devices
- `icon-128x128.png` - HD devices
- `icon-144x144.png` - Microsoft tiles
- `icon-152x152.png` - iOS devices
- `icon-192x192.png` - Standard PWA icon (required)
- `icon-384x384.png` - High-res displays
- `icon-512x512.png` - Splash screens (required)

## Tools for Generating Icons

### Online Tools
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) - Upload one image, get all sizes
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Comprehensive favicon and PWA icon generator

### Command Line Tools
```bash
# Using sharp-cli
npm install -g sharp-cli
sharp -i logo.png -o icon-72x72.png resize 72 72
sharp -i logo.png -o icon-96x96.png resize 96 96
sharp -i logo.png -o icon-128x128.png resize 128 128
sharp -i logo.png -o icon-144x144.png resize 144 144
sharp -i logo.png -o icon-152x152.png resize 152 152
sharp -i logo.png -o icon-192x192.png resize 192 192
sharp -i logo.png -o icon-384x384.png resize 384 384
sharp -i logo.png -o icon-512x512.png resize 512 512
```

## Design Guidelines

- **Maskable Icons**: Ensure your icon has sufficient padding (safe zone) for different device shapes
- **Background**: Icons should work well on both light and dark backgrounds
- **Simplicity**: Keep the design simple and recognizable at small sizes
- **Format**: PNG format with transparent background works best

## Testing

Test your icons in Chrome DevTools:
1. Open DevTools (F12)
2. Go to Application tab
3. Click on Manifest
4. Check icon preview and any warnings

## Related Files

- `/public/manifest.json` - References these icons
- `/public/screenshots/` - App screenshots for PWA install prompts
