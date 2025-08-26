// Cargar herramientas desde JSON
async function loadTools() {
  try {
    const response = await fetch('data/tools.json');
    if (!response.ok) throw new Error('Archivo no encontrado: ' + response.status);

    const tools = await response.json();
    console.log('✅ Herramientas cargadas:', tools);

    const container = document.getElementById('tools-container');
    container.innerHTML = ''; // Limpiar

    tools.forEach(tool => {
      const btn = document.createElement('button');
      btn.className = 'tool-btn';
      btn.dataset.tool = tool.id;
      btn.innerHTML = `<i class="${tool.icon}"></i> ${tool.name}`;
      container.appendChild(btn);
    });

    initApp(tools);
  } catch (error) {
    console.error('❌ Error al cargar herramientas:', error);
    const scrollingText = document.getElementById('scrolling-text');
    if (scrollingText) {
      scrollingText.textContent = '❌ Error: No se pudo cargar data/tools.json. Verifica que exista.';
    }
  }
}

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

  // ✍️ Efecto de máquina de escribir
  function typeText(text, callback) {
  const words = text.split(' ');
  scrollingText.textContent = '';
  let i = 0;

  const interval = setInterval(() => {
    if (i < words.length) {
      scrollingText.textContent += (i === 0 ? '' : ' ') + words[i];
      i++;
      // Hacer scroll suave si el texto es muy alto
      scrollingText.style.height = 'auto';
    } else {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 150); // 150ms por palabra (ajustable)
}

  // ⬆️ Mover texto de abajo hacia arriba
  function moveUp() {
    if (animationId) cancelAnimationFrame(animationId);

    const containerHeight = content.offsetHeight;
    let position = -scrollingText.offsetHeight - 50;

    function animate() {
      if (!isPaused) {
        position += speed;
        scrollingText.style.bottom = `${position}px`;

        if (position > containerHeight) {
          position = -scrollingText.offsetHeight - 50;
        }
      }
      animationId = requestAnimationFrame(animate);
    }
    animate();
  }

  // 🔘 Eventos de botones
  document.querySelectorAll(".tool-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentTool = btn.dataset.tool;
      const tool = tools[currentTool];
      scrollingText.style.fontSize = fontSizeControl.value;
      isPaused = false;
      pauseBtn.textContent = "⏸️ Pausar";
      scrollingText.textContent = '';
      scrollingText.style.bottom = '-100px';

      typeText(tool.text, moveUp);
    });
  });

  // 🎚️ Controles
  speedControl.addEventListener("input", () => {
    speed = parseInt(speedControl.value);
    speedValue.textContent = speed;
    if (currentTool) moveUp();
  });

  fontSizeControl.addEventListener("change", () => {
    scrollingText.style.fontSize = fontSizeControl.value;
    if (currentTool) moveUp();
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
      scrollingText.textContent = '';
      scrollingText.style.bottom = '-100px';
      isPaused = false;
      pauseBtn.textContent = "⏸️ Pausar";
      typeText(tools[currentTool].text, moveUp);
    }
  });

  previewBtn.addEventListener("click", () => {
    document.body.classList.toggle("preview-mode");
    previewBtn.textContent = document.body.classList.contains("preview-mode")
      ? "❌ Salir de Previsualización"
      : "🔍 Previsualizar App";
  });

  window.addEventListener("resize", () => {
    if (currentTool) moveUp();
  });
}

// 🔥 Iniciar
loadTools();

// 🛠️ Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('js/sw.js')
    .then(reg => console.log('SW registrado:', reg.scope))
    .catch(err => console.log('Error al registrar SW:', err));
}
