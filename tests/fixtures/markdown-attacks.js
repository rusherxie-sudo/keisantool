export const attacks = [
  ['script', '<script>window.__kt01Canary=1</script><p>safe</p>'],
  ['events', '<p onclick="window.__kt01Canary=1" onmouseover="window.__kt01Canary=1">click</p>'],
  ['javascript links', '[click](javascript:window.__kt01Canary=1) <a href="javascript:window.__kt01Canary=1">raw</a>'],
  ['obfuscated links', '<a href="jav&#x61;script:window.__kt01Canary=1">entity</a><a href="java&#x09;script:window.__kt01Canary=1">tab</a><a href="JaVaScRiPt:window.__kt01Canary=1">case</a>'],
  ['images', '<img src="/kt01-missing" onerror="window.__kt01Canary=1"><img src="javascript:window.__kt01Canary=1"><img src="data:image/svg+xml,<svg onload=window.__kt01Canary=1></svg>">'],
  ['SVG / MathML', '<svg onload="window.__kt01Canary=1"><a xlink:href="javascript:window.__kt01Canary=1">x</a><foreignObject><img src="/kt01-missing" onerror="window.__kt01Canary=1"></foreignObject></svg><math><mtext><img src="/kt01-missing" onerror="window.__kt01Canary=1"></mtext></math>'],
  ['mutation nesting', '<math><mtext><table><mglyph><style><!--</style><img title="--><img src=/kt01-missing onerror=window.__kt01Canary=1>">'],
  ['active containers', '<iframe srcdoc="<script>parent.__kt01Canary=1</script>"></iframe><object data="/kt01-missing"></object><embed src="/kt01-missing"><form action="/kt01-missing"><input autofocus onfocus="window.__kt01Canary=1"><button formaction="javascript:window.__kt01Canary=1">submit</button></form>'],
  ['styles / clobbering', '<style>body{display:none}</style><link rel="stylesheet" href="/kt01-missing"><meta http-equiv="refresh" content="0;url=/kt01-missing"><p id="md-input" name="location" style="position:fixed" data-x="1">safe</p>'],
  ['other URL schemes', '<a href="data:text/html,<script>window.__kt01Canary=1</script>">data</a><a href="vbscript:msgbox(1)">vb</a><a href="file:///tmp/test">file</a><img srcset="/kt01-missing 2x" src="blob:invalid">'],
];
