(function () {
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initNeuralBackground() {
    var canvas = document.getElementById("aip-neural-canvas");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var nodes = [];
    var rafId = null;
    var reduceMotion = prefersReducedMotion();

    function resize() {
      var parent = canvas.parentElement;
      var width = parent ? parent.clientWidth : window.innerWidth;
      var height = parent ? parent.clientHeight : window.innerHeight;
      var dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedNodes(width, height);
      if (reduceMotion) draw(0);
    }

    function seedNodes(width, height) {
      var count = Math.max(10, Math.floor((width * height) / 28000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 1.2 + Math.random() * 1.8,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw(time) {
      var width = canvas.clientWidth;
      var height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i];
          var b = nodes[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            var alpha = (1 - dist / 140) * 0.35;
            ctx.strokeStyle = "rgba(125, 211, 252," + alpha + ")";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k];
        var pulse = reduceMotion ? 1 : 0.65 + 0.35 * Math.sin(time / 900 + n.phase);
        ctx.beginPath();
        ctx.fillStyle = "rgba(34, 211, 238," + (0.55 * pulse) + ")";
        ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function tick(time) {
      var width = canvas.clientWidth;
      var height = canvas.clientHeight;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
      draw(time);
      rafId = window.requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);

    if (!reduceMotion) {
      rafId = window.requestAnimationFrame(tick);
    }

    window.addEventListener("beforeunload", function () {
      if (rafId) window.cancelAnimationFrame(rafId);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNeuralBackground);
  } else {
    initNeuralBackground();
  }
})();
