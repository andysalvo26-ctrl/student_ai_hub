# Wix Embed Instructions

## Overview

The `dist/home.html` file is a self-contained HTML file optimized for embedding in a Wix site using an HTML iframe or embed element. It contains no external dependencies and is designed to work within a fixed-height container.

## Embedding in Wix

### Method 1: HTML Embed Element (Recommended)

1. **In Wix Editor:**
   - Add an HTML embed element to your page
   - Click "Enter Code" or "Edit Code"

2. **Paste the HTML:**
   - Open `dist/home.html` in a text editor
   - Copy the entire file contents
   - Paste into the Wix HTML embed element

3. **Configure embed settings:**
   - **Height**: Set to "Auto" or a fixed height (recommended: 1200px minimum, 1500px preferred)
   - **Width**: Set to "100% of container" or "Full width"
   - **Scrolling**: Set to "Auto" (allows scrolling if content exceeds height)

4. **Save and preview:**
   - Save the page
   - Preview to verify the embed displays correctly
   - Test on mobile view

### Method 2: HTML iframe Element

1. **In Wix Editor:**
   - Add an HTML iframe element

2. **Configure iframe:**
   - **Source**: Host `home.html` on a web server and enter the URL
   - **Width**: 100% or specific pixel width
   - **Height**: Auto or specific pixel height (recommended: 1200-1500px)
   - **Scrolling**: Auto

3. **Note**: This method requires hosting the HTML file externally.

## Recommended Embed Height Settings

### Initial Setup
- **Minimum height**: 1200px
- **Recommended height**: 1500px
- **Maximum height**: 2000px (or Auto with scrolling)

### Why Fixed Height?
The embed wrapper uses `min-height: 100%` to fill the container. Setting a fixed height ensures:
- Consistent layout across page loads
- Proper spacing and visual hierarchy
- Predictable scrolling behavior

### Adjusting Height
If content exceeds the embed height:
- Increase the embed height setting in Wix
- Or enable scrolling (set to "Auto")

## Updating URLs When Wix Pages Are Ready

When Wix page URLs are known, update the `linksData` object in `dist/home.html`:

1. **Locate the linksData object** in the JavaScript section (around line 200+)

2. **Replace placeholder URLs** with actual Wix page URLs:
   ```javascript
   const linksData = {
       "ai-basics": "/ai-basics",  // Replace with actual Wix page URL
       "using-ai-school-work": "/using-ai-school-work",
       // ... etc
   };
   ```

3. **URL Format Options:**
   - **Relative paths**: `/page-name` (opens in same tab)
   - **Full URLs**: `https://yoursite.wixsite.com/page-name`
   - **Wix page IDs**: Use Wix's page ID format if preferred

4. **After updating:**
   - Re-paste the updated HTML into the Wix embed element
   - Test all links to ensure they navigate correctly

## Content Updates

### Updating Text Content

1. **Edit source files** in `src/`:
   - `src/content.json` — All visible text
   - `src/links.json` — All URLs

2. **Rebuild dist file:**
   - Run the build script or manually combine:
     - HTML structure from `src/index.html`
     - CSS from `src/styles.css` (inline)
     - JSON data embedded in JavaScript
     - JavaScript from `src/render.js` (inline)

3. **Update Wix embed:**
   - Copy the new `dist/home.html` contents
   - Paste into the Wix HTML embed element
   - Save and preview

## Styling Considerations

### Wix Page Styles
- The embedded content uses its own CSS (inline in dist version)
- Wix page styles should not conflict
- The embed wrapper has `max-width: 1200px` and centers itself

### Responsive Behavior
- The embed is responsive within its container
- Mobile breakpoints are handled at 768px and 480px
- Test on mobile devices through Wix's mobile preview

### Color Scheme
- Uses system fonts (no external font loading)
- Neutral color palette (grays, blues)
- Accessible contrast ratios

## Testing Checklist

Before publishing:
- [ ] Embed displays correctly in desktop view
- [ ] Embed displays correctly in mobile view
- [ ] All section tiles render properly
- [ ] Links navigate correctly (when URLs are set)
- [ ] Human-maintained tags display correctly
- [ ] Footer appears at bottom
- [ ] No horizontal scrolling
- [ ] Text is readable at all screen sizes

## Troubleshooting

### Content Not Appearing
- Check browser console for JavaScript errors
- Verify JSON data is properly formatted in the script
- Ensure all IDs match between HTML and JavaScript

### Height Issues
- Increase embed height setting in Wix
- Check that `min-height: 100%` is working in the embed wrapper
- Enable scrolling if content exceeds container

### Links Not Working
- Verify URLs are updated in `linksData` object
- Check that URLs use correct format (relative paths recommended)
- Test links in preview mode

### Styling Conflicts
- The embed uses inline CSS to avoid conflicts
- If Wix styles interfere, check for CSS specificity issues
- Consider adding `!important` to critical styles if needed

## Notes

- The dist file is intentionally self-contained to avoid CORS issues
- All data is embedded in the HTML/JS, not loaded externally
- No external API calls or dependencies
- Works offline once loaded
- Links open in the same tab by default (normal `<a>` behavior)
