# PWA Screenshots

This directory should contain screenshots of your app for the PWA install prompts.

## Required Screenshots

Add the following screenshots to enhance your PWA install experience:

- `desktop.png` - Desktop/tablet view (1280x720 or wider)
- `mobile.png` - Mobile view (750x1334 or taller)

## Guidelines

### Desktop Screenshots
- **Dimensions**: Minimum 1280x720, recommended 1920x1080
- **Aspect Ratio**: 16:9 (landscape orientation)
- **Content**: Show key features and UI elements
- **Form Factor**: "wide" in manifest.json

### Mobile Screenshots
- **Dimensions**: Minimum 750x1334, recommended 1242x2208
- **Aspect Ratio**: 9:16 (portrait orientation)
- **Content**: Show mobile-optimized interface
- **Form Factor**: "narrow" in manifest.json

## Best Practices

1. **Multiple Screenshots**: Include 3-5 screenshots showing different features
2. **Quality**: Use high-resolution images without pixelation
3. **Real Content**: Show actual app content, not placeholder text
4. **Consistency**: Maintain consistent styling across screenshots
5. **Status Bars**: Include device chrome (status bar, navigation) for authenticity

## Capturing Screenshots

### Using Chrome DevTools
```
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select device or set custom dimensions
4. Navigate to your app
5. Right-click > "Capture screenshot"
```

### Using Browser Extensions
- [GoFullPage](https://gofullpage.com/) - Full page screenshots
- [Awesome Screenshot](https://www.awesomescreenshot.com/) - Annotated screenshots

## Testing

View your screenshots in action:
1. Open Chrome DevTools
2. Application tab > Manifest
3. Check "Screenshots" section
4. Test install prompt on Android/Desktop Chrome

## File Format

- **Format**: PNG (recommended) or JPEG
- **Compression**: Optimize file size while maintaining quality
- **Max Size**: Keep under 1MB per screenshot for fast loading

## Related Files

- `/public/manifest.json` - References these screenshots
- `/public/icons/` - App icons
