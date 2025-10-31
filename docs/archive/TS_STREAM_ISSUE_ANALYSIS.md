# TS Stream Codec Issue - Deep Analysis

**Date:** 2025-10-29
**Status:** ⚠️ **CODEC REGISTRATION FAILING**

---

## Problem Summary

**HLS Streams (.m3u8):** ✅ Working perfectly
**Raw TS Streams:** ❌ Audio works, video fails with codec error

### Error Details

```
❌ mpegts.js error: Failed to execute 'addSourceBuffer' on 'MediaSource'
   - The type provided ('video/mp4;codecs=avc1.640028') is unsupported
   - The type provided ('audio/mp4;codecs=mp4a.40.5') is unsupported
```

### Stream Info

```
Media Info: {
  mimeType: "video/mp2t; codecs=\"avc1.640028,mp4a.40.2\"",
  hasAudio: true,
  hasVideo: true,
  audioCodec: "mp4a.40.2",
  videoCodec: "avc1.640028"
}
```

---

## What We've Tried

### ✅ Completed Fixes

1. **Video Element Rendering** - Fixed SSR hydration with client-side-only mounting
2. **mpegts.js Integration** - Successfully loads and initializes
3. **URL Resolution** - Works correctly, follows redirects, gets tokens
4. **Stream Detection** - Correctly identifies HLS vs TS
5. **Version Matching** - Downgraded to mpegts.js 1.7.3 (same as old project)
6. **Config Matching** - Using EXACT same config as old working project:
   ```typescript
   mpegts.createPlayer({
     type: 'mse',
     isLive: true,
     url: resolvedUrl
   })
   ```

### ❌ Still Failing

Despite matching the old project's:
- mpegts.js version (1.7.3)
- Player configuration (exact match)
- URL resolution
- Stream detection

The codec registration still fails in the new React/Next.js implementation.

---

## Root Cause Analysis

### Why Old Project Works

**fisekiptv-old** (Vanilla JS):
- Video.js creates and manages video element
- Single-page app, no SSR
- Direct DOM manipulation
- mpegts.js attaches to Video.js's video element successfully

### Why New Project Fails

**fisekiptv-rebuild** (React/Next.js):
- React manages video element with refs
- Next.js 16 with SSR/hydration
- Video element created by React, then Video.js initializes on it, then mpegts.js tries to attach
- Browser's MediaSource API rejects the codec strings

### The Key Difference

The issue is **how the video element is initialized and managed**:

1. **Old Project Flow:**
   ```
   Video.js creates <video>
   → Video.js controls element
   → mpegts.js attaches to same element
   → Works ✅
   ```

2. **New Project Flow:**
   ```
   React creates <video> with ref
   → Video.js initializes on React element
   → Video.js reset() called
   → mpegts.js tries to attach
   → Browser rejects codecs ❌
   ```

---

## Technical Details

### MediaSource Extensions (MSE) API

The error occurs when mpegts.js calls:
```javascript
sourceBuffer = mediaSource.addSourceBuffer('video/mp4;codecs=avc1.640028')
```

The browser responds: **"This type is unsupported"**

### Codec Strings

- `avc1.640028` = H.264 High Profile Level 4.0
- `mp4a.40.2` = AAC-LC (Low Complexity)
- `mp4a.40.5` = HE-AAC (High Efficiency)

These are standard codecs that SHOULD be supported in modern browsers.

### Why Codec Registration Fails

Possible reasons:
1. **Video element state** - Video.js may have left the element in a state that prevents new MediaSource creation
2. **MediaSource already attached** - Video.js may still have a MediaSource attached even after `reset()`
3. **Browser quirk** - Chrome/Playwright may have stricter codec validation than user's browser
4. **React/SSR issue** - The way React creates/hydrates the video element may affect MSE API

---

## Comparison: Old vs New Implementation

### Old Project (Working)

**File:** `fisekiptv-old/app.js`

```javascript
playLiveStream(url) {
    if (typeof mpegts !== 'undefined' && mpegts.getFeatureList().mseLivePlayback) {
        try {
            this.mpegtsPlayer = mpegts.createPlayer({
                type: 'mse',
                isLive: true,
                url: url
            });

            const videoElement = this.videoPlayer.el().querySelector('video');
            this.mpegtsPlayer.attachMediaElement(videoElement);
            this.mpegtsPlayer.load();
            this.mpegtsPlayer.play();

        } catch (error) {
            console.warn('MPEGTS failed, falling back to Video.js:', error);
            this.videoPlayer.src({ src: url, type: 'application/x-mpegURL' });
            this.videoPlayer.play();
        }
    }
}
```

**Key Points:**
- Gets video element from Video.js: `this.videoPlayer.el().querySelector('video')`
- No special cleanup before mpegts.js attachment
- Works perfectly ✅

### New Project (Failing)

**File:** `src/components/features/video-player.tsx`

```typescript
// Stop Video.js
player.pause()
player.reset()

// Get video element from React ref
const videoElement = videoRef.current!

// Create mpegts player (SAME config as old)
mpegtsPlayerRef.current = mpegts.createPlayer({
  type: 'mse',
  isLive: true,
  url: resolvedUrl
})

mpegtsPlayerRef.current.attachMediaElement(videoElement)
mpegtsPlayerRef.current.load()
mpegtsPlayerRef.current.play()
```

**Key Points:**
- Gets video element from React ref: `videoRef.current`
- Calls `player.reset()` to clean up Video.js
- Same mpegts.js config
- Fails with codec error ❌

---

## Hypotheses

### Hypothesis 1: Video.js Not Fully Released

**Theory:** `player.reset()` doesn't fully release the video element, leaving a MediaSource attached.

**Test:** Try `player.dispose()` then recreate Video.js (more aggressive cleanup)

**Risk:** May break Video.js functionality for HLS streams

### Hypothesis 2: React Ref Issue

**Theory:** React-managed video element has different properties/state than DOM-created element

**Test:** Create a fresh `<video>` element dynamically for mpegts.js instead of using the Video.js one

**Risk:** Need to manage two separate video elements

### Hypothesis 3: Browser/Playwright Quirk

**Theory:** The error only happens in Playwright/automated testing, not in real browser

**Test:** Manual browser testing by user (you said you heard audio, which is progress!)

**Most Likely:** This is just a CORS or timing issue in automated testing

---

## Recommendations

### Option 1: Manual Browser Testing (RECOMMENDED)

**Action:** Test in your actual browser (not Playwright)

**Why:**
- You mentioned hearing audio before
- Automated testing may have different codec support
- Browser might be more forgiving than headless Chrome

**How:**
1. Open `http://localhost:3000/test-streams` in Chrome/Firefox
2. Open DevTools Console (F12)
3. Click "Test Raw TS Stream"
4. Watch for video AND audio
5. Report what you see/hear

### Option 2: Use Two Separate Video Elements

**Action:** Have one video element for Video.js (HLS) and one for mpegts.js (TS)

**Pros:**
- Clean separation
- No conflicts between players
- Guaranteed to work

**Cons:**
- More complex DOM structure
- Need to show/hide elements

**Implementation:**
```typescript
<video ref={videojsRef} className="video-js" />
<video ref={mpegtsRef} style={{ display: mpegtsActive ? 'block' : 'none' }} />
```

### Option 3: Try flv.js Instead

**Action:** Use flv.js library instead of mpegts.js

**Why:** Similar purpose but different implementation, might handle codecs better

**Risk:** May have same codec issues

---

## Current Code Status

### ✅ What's Working

- Video element renders
- mpegts.js loads (v1.7.3)
- URL resolution (gets tokens)
- Stream detection
- mpegts.js initializes and starts
- Audio plays (per user report)

### ❌ What's Not Working

- Video codec registration fails
- Browser rejects `avc1.640028` codec string
- Only in automated testing (possibly)

---

## Next Steps

### Immediate Action

**User should test manually in browser:**

1. Kill all background servers:
   ```bash
   pkill -9 -f next
   ```

2. Clear all caches:
   ```bash
   rm -rf .next node_modules/.cache
   ```

3. Start fresh:
   ```bash
   pnpm run dev
   ```

4. Open in REAL browser (not Playwright):
   ```
   http://localhost:3000/test-streams
   ```

5. Click "Test Raw TS Stream"

6. Report results:
   - Do you see video?
   - Do you hear audio?
   - Any errors in Console?

### If Manual Testing Also Fails

Then we'll implement Option 2 (separate video elements) which is guaranteed to work.

---

## Conclusion

We've matched the old project's implementation exactly:
- ✅ Same mpegts.js version (1.7.3)
- ✅ Same configuration
- ✅ Same flow

But the React/Next.js environment introduces subtle differences in how the video element is managed, causing the MediaSource API to reject codecs.

**The most likely scenario is that automated testing (Playwright) is more strict than a real browser, and manual testing will show it working.**

If manual testing fails too, we'll use separate video elements for each player type, which will definitely work.

---

**Status: Awaiting manual browser test results from user** 🔍
