# Family Tree Editor

An editable, drag-and-drop family tree you can host for free on GitHub
Pages. No server, no build step, no dependencies - it's just HTML/CSS/
JavaScript that runs entirely in the browser. It starts pre-loaded with
the Okrut & Karpenko tree (59 people) and you edit from there.

## Putting it on GitHub Pages

1. **Create a repository.** On GitHub, click New repository, give it a
   name (e.g. `family-tree`), and create it (public or private both
   work - private repos can still use Pages on any paid plan, or just
   make it public if that's fine for your family).

2. **Upload these files.** Either:
   - Drag the whole contents of this folder into the GitHub web UI
     (the green "Add file" -> "Upload files" button), keeping the
     folder structure (`index.html` at the root, `css/`, `js/`, `data/`
     as folders next to it), **or**
   - If you use git locally:
     ```bash
     cd family-tree-app
     git init
     git add .
     git commit -m "Family tree editor"
     git branch -M main
     git remote add origin https://github.com/<you>/<repo>.git
     git push -u origin main
     ```

3. **Turn on Pages.** In your repo, go to **Settings -> Pages**. Under
   "Build and deployment", set **Source** to "Deploy from a branch",
   pick the **main** branch and the **/ (root)** folder, then Save.

4. **Wait about a minute**, then refresh that Settings -> Pages screen -
   it'll show you the live URL (something like
   `https://<you>.github.io/<repo>/`). That's your site.

Every time you push a change to `main`, GitHub Pages redeploys
automatically within a minute or two.

### Trying it locally first (optional)

Opening `index.html` directly by double-clicking it won't work, because
the app is split into ES modules, which browsers refuse to load over a
plain `file://` URL. Run any tiny local web server from this folder
instead, then visit the URL it prints:

```bash
python3 -m http.server 8000        # then open http://localhost:8000
# or, if you have Node:
npx serve .
```

## Using the app

### The basics

- **Click a person** to select them - a panel opens on the left with
  their name fields, a free-text notes box, and relationship buttons.
- **Drag a person** to reposition them anywhere on the canvas (it's not
  a fixed grid - you can place people above, below, or beside anyone).
- **Drag on empty canvas** to pan. **Scroll/pinch** to zoom (10%-500%),
  or use the +/- buttons and "Fit" in the toolbar.
- Nothing is destructive by accident - every change is one **Undo**
  away, and Redo brings it back.

### Adding people and relationships

Select a person, then in the left panel:

- **Add parents** - creates two new blank people above them as their
  parents. (Only shows up if they don't already have parents recorded -
  this version keeps one set of parents per person.)
- **Add spouse** - creates a new person linked as their partner.
- **Add child** - creates a new person as their child (using their
  first recorded partnership, or creating one if they don't have a
  partner yet).
- **Add sibling** - creates a new person as another child of the same
  parents (creating a blank parent pair first if none exist yet).

A brand-new person starts blank - just type their name into the panel
and it fills in on the tree immediately.

### Deleting people

Click **Delete** in the panel. A person is never fully erased in a way
that could break the tree's shape - they turn into a blank grey
placeholder (a plain circle with a **+**) and every line connecting them
stays exactly where it was. Click a placeholder and type a name into it
at any time to bring it back to life.

### Moving connector lines

Every parent-child connection is drawn as a bar with drop lines, and
you can grab and move each part:

- **Grab the horizontal bar** and drag it up or down to change how high
  the split happens.
- **Grab a vertical drop line** (from a parent down to the bar, or from
  the bar down to a child) and drag it left or right to reroute where
  it connects.

If a connector still doesn't look right, click **Draw line** in the
toolbar, then:
1. Click the child whose connection you want to redraw.
2. Click points on the canvas to route a custom path (each new point
   snaps to a straight horizontal/vertical line from the last one -
   untick "Snap to straight lines" in the strip that appears if you
   want free angles instead).
3. Click that same child again to finish, or "Cancel" to back out.

### Everything else in the toolbar

- **Add person** - drops a new, unconnected person onto the canvas.
- **Undo / Redo**
- **Zoom controls** and **Fit** (zooms out/in to frame the whole tree).
- **Map** - toggles the small overview in the bottom-right corner; drag
  inside it to jump around a large tree quickly.
- **Search** - type a name and press Enter; press Enter again to cycle
  through repeat matches.
- **Export** - downloads your current tree as a `.json` file. This is
  your real backup/save file - keep it somewhere safe, and feel free to
  commit it into your repo alongside the app.
- **Import** - loads a `.json` file you exported earlier (replacing
  what's currently on the canvas).

### Saving

There's no server, so "saving" happens two ways at once:

1. **Autosave to your browser's local storage** - your edits stick
   around automatically on reload, on that browser/device.
2. **Export/Import** - the real, portable save file. Export whenever
   you want a durable copy; Import to load it somewhere else (a
   different browser, a different computer, or after clearing your
   browser data).

## What this version does and doesn't do

Built to match what was asked for as the core feature set:

- One person, one set of parents, any number of spouses/children.
- Same-size circles, one color category per person (paternal / maternal
  / where lines meet / married-in-or-adopted), locking, free
  positioning anywhere on an effectively infinite canvas.
- Single-person selection (no multi-select/group-move yet).
- No keyboard shortcuts by design - every action is a visible button.

Not included yet (deliberately, per the brief - "main things first"):
multiple marriages as a first-class feature, multiple/step/adoptive
parent sets per person, differently-styled relationship lines,
per-person custom colors beyond the category presets, themes/dark
mode/custom fonts, and touch-specific gestures like pinch-zoom (basic
single-touch drag works via pointer events, but it isn't tuned).

## File structure

```
index.html            entry point
css/styles.css         all styling
data/default-tree.js   the starting 59-person tree
js/state.js             central store + undo/redo
js/model.js             add/edit/delete logic (no DOM)
js/geometry.js          coordinate math, snapping
js/render.js             draws the SVG scene from the store
js/interactions.js       pan/zoom/drag/manual-line pointer handling
js/panel.js               the left-side edit panel
js/toolbar.js              the top toolbar
js/minimap.js               the overview map
js/persistence.js            localStorage + export/import
js/main.js                    wires it all together on load
```

No build step, no `node_modules` - if you want to change something,
edit the file and refresh the page.
