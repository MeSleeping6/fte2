<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Family Tree Editor</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Inter:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
<link rel="stylesheet" href="css/styles.css" />
</head>
<body>
<div id="app">
  <div id="toolbar" role="toolbar" aria-label="Tree editor tools"></div>
  <div id="toolbar-substrip" class="toolbar-substrip" aria-hidden="true"></div>

  <div id="canvas-wrap">
    <svg id="canvas-svg" xmlns="http://www.w3.org/2000/svg">
      <g id="viewport-group">
        <g id="layer-connectors"></g>
        <g id="layer-people"></g>
        <g id="layer-draft"></g>
      </g>
    </svg>

    <aside id="side-panel" aria-label="Edit person"></aside>
    <div id="minimap" aria-label="Tree overview map"></div>
  </div>
</div>

<noscript>This app needs JavaScript enabled to run.</noscript>
<script type="module" src="js/main.js"></script>
</body>
</html>
