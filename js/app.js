// Cargar herramientas desde JSON
async function loadTools() {
  try {
    const response = await fetch('data/tools.json');
    const tools = await response.json();
    const container = document.getElementById('tools-container');

    tools.forEach(tool => {
      const btn = document.createElement('button');
      btn.className = 'tool-btn';
      btn.dataset.tool = tool.id;
      btn.innerHTML = `<i class="${tool.icon}"></i> ${tool.name}`;
      container.appendChild(btn);
    });

    initApp(tools);
  } catch (error) {
    console.error('Error al cargar herramientas:', error);
    document.getElementById('scrolling-text').textContent = 'Error al cargar herramientas. Verifica tu conexión.';
  }
}

// Inicializar funcionalidad
function initApp(toolsArray) {
  const tools = {};
  toolsArray.forEach(t => tools[t.id] = t);

  const scrollingText = document.getElementById("scrolling-text");
  const content = document.getElementById("content");
  const speedControl = document.getElementById("speed");
  const speedValue = document.getElementById("speed-value");
  const fontSizeControl = document.getElementById("font-size");
  const mirrorControl = document.getElementById("mirror");
  const pauseBtn = document.getElementById("pause");
  const restartBtn = document.getElementById("restart");
  const readTime = document.getElementById("read-time");
  const previewBtn = document.getElementById("preview-btn");

  let animationId = null;
  let isPaused = false;
  let currentTool = null;
  let speed = 5;

  function startScrolling() {
    if (animationId) cancelAnimationFrame(animationId);

    // Posicionar el texto fuera de la parte superior
    scrollingText.style.top = `-${scrollingText.offsetHeight + 50}px`;
    scrollingText.style.left = '50%';
    scrollingText.style.transform = 'translateX(-50%)';

    const containerHeight = content.offsetHeight;
    const textHeight = scrollingText.offsetHeight;
    const totalDistance = containerHeight + textHeight + 50;
    const durationMs = (totalDistance / speed) * 20;
    const estimatedTime = (durationMs / 1000).toFixed(0);
    readTime.textContent = tools[currentTool]?.readTime || `${estimatedTime}s`;

    function animate() {
      if (!isPaused) {
        const currentTop = parseFloat(scrollingText.style.top);
        const newTop = currentTop + speed;

        // Si el texto ya está completamente fuera por abajo, reinícialo
        if (newTop > containerHeight + textHeight) {
          scrollingText.style.top = `-${textHeight + 50}px`;
        } else {
          scrollingText.style.top = `${newTop}px`;
        }
      }
      animationId = requestAnimationFrame(animate);
    }
    animate();
  }

  // Eventos de botones
  document.querySelectorAll(".tool-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentTool = btn.dataset.tool;
      const tool = tools[currentTool];
      scrollingText.textContent = tool.text;
      scrollingText.style.fontSize = fontSizeControl.value;
      isPaused = false;
      pauseBtn.textContent = "⏸️ Pausar";
      startScrolling();
    });
  });

  // Controles
  speedControl.addEventListener("input", () => {
    speed = parseInt(speedControl.value);
    speedValue.textContent = speed;
    if (currentTool) startScrolling();
  });

  fontSizeControl.addEventListener("change", () => {
    scrollingText.style.fontSize = fontSizeControl.value;
    if (currentTool) startScrolling();
  });

  mirrorControl.addEventListener("change", () => {
    scrollingText.classList.toggle("mirror", mirrorControl.checked);
  });

  pauseBtn.addEventListener("click", () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "▶️ Reanudar" : "⏸️ Pausar";
  });

  restartBtn.addEventListener("click", () => {
    if (currentTool) {
      scrollingText.style.top = `-${scrollingText.offsetHeight + 50}px`;
      isPaused = false;
      pauseBtn.textContent = "⏸️ Pausar";
      startScrolling();
    }
  });

  previewBtn.addEventListener("click", () => {
    document.body.classList.toggle("preview-mode");
    previewBtn.textContent = document.body.classList.contains("preview-mode")
      ? "❌ Salir de Previsualización"
      : "🔍 Previsualizar App";
  });

  window.addEventListener("resize", () => {
    if (currentTool) startScrolling();
  });

  // Solicitar instalación
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    setTimeout(() => {
      if (confirm("¿Quieres instalar esta app para usarla offline?")) {
        e.prompt();
      }
    }, 2000);
  });
}

// Cargar al inicio
loadTools();

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('js/sw.js')
    .then(reg => console.log('SW registrado:', reg.scope))
    .catch(err => console.log('Error al registrar SW:', err));
}
