// ═══════════════════════════════════════════════════════
// DUNA — CRÔNICAS DE ARRAKIS
// JavaScript — Manipulação do DOM
// ═══════════════════════════════════════════════════════

// ─── 1. CANVAS DE PARTÍCULAS (areia flutuante) ───────
// Demonstra: Canvas API, requestAnimationFrame,
// manipulação de arrays de objetos, window events

const canvasAreia = document.getElementById("canvas-areia");
const contexto = canvasAreia.getContext("2d");

let particulas = [];
let largura = 0;
let altura = 0;

function redimensionarCanvas() {
  largura = canvasAreia.width = window.innerWidth;
  altura = canvasAreia.height = window.innerHeight;
  criarParticulas();
}

function criarParticulas() {
  particulas = [];
  const total = Math.max(70, Math.floor((largura * altura) / 18000));

  for (let i = 0; i < total; i++) {
    particulas.push({
      x: Math.random() * largura,
      y: Math.random() * altura,
      r: Math.random() * 1.9 + 0.4,
      velocidadeX: Math.random() * 0.6 + 0.15,
      velocidadeY: Math.random() * 0.45 + 0.05,
      opacidade: Math.random() * 0.45 + 0.08,
    });
  }
}

function desenharParticulas() {
  contexto.clearRect(0, 0, largura, altura);

  for (const particula of particulas) {
    contexto.beginPath();
    contexto.fillStyle = `rgba(245, 220, 160, ${particula.opacidade})`;
    contexto.arc(particula.x, particula.y, particula.r, 0, Math.PI * 2);
    contexto.fill();

    particula.x += particula.velocidadeX;
    particula.y += particula.velocidadeY;

    if (particula.x > largura + 10) particula.x = -10;
    if (particula.y > altura + 10) {
      particula.y = -10;
      particula.x = Math.random() * largura;
    }
  }

  requestAnimationFrame(desenharParticulas);
}

redimensionarCanvas();
desenharParticulas();
window.addEventListener("resize", redimensionarCanvas);

// ─── 2. REVEAL ON SCROLL (IntersectionObserver) ──────
// Demonstra: IntersectionObserver, classList.add,
// querySelectorAll, forEach

const elementosRevelar = document.querySelectorAll(
  ".revelar, .cabecalho-ato, .cartao-capitulo, .bloco-citacao, .vinil-container, .spotify-nota",
);

const observadorRevelacao = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("revelado");
      }
    });
  },
  {
    threshold: 0.1,
  },
);

elementosRevelar.forEach((elemento) => observadorRevelacao.observe(elemento));

// ─── 3. SCROLL SPY — Navegação ativa ─────────────────
// Demonstra: IntersectionObserver com múltiplos targets,
// classList.toggle, getAttribute, template literals

const linksMenu = document.querySelectorAll(".barra-navegacao a");
const secoes = document.querySelectorAll("main section[id]");

const observadorSecoes = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        linksMenu.forEach((link) => {
          link.classList.toggle(
            "link-ativo",
            link.getAttribute("href") === `#${entrada.target.id}`,
          );
        });
      }
    });
  },
  {
    threshold: 0.25,
    rootMargin: "-80px 0px 0px 0px",
  },
);

secoes.forEach((secao) => observadorSecoes.observe(secao));

// ─── 4. MENU MOBILE ─────────────────────────────────
// Demonstra: addEventListener('click'), classList.toggle,
// event delegation, querySelectorAll com forEach

const botaoMenu = document.getElementById("botao-menu");
const navPrincipal = document.getElementById("nav-principal");

botaoMenu.addEventListener("click", () => {
  botaoMenu.classList.toggle("ativo");
  navPrincipal.classList.toggle("nav-aberta");
});

// Fechar menu ao clicar em um link
navPrincipal.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    botaoMenu.classList.remove("ativo");
    navPrincipal.classList.remove("nav-aberta");
  });
});

// Fechar menu ao clicar fora
document.addEventListener("click", (evento) => {
  if (
    !botaoMenu.contains(evento.target) &&
    !navPrincipal.contains(evento.target)
  ) {
    botaoMenu.classList.remove("ativo");
    navPrincipal.classList.remove("nav-aberta");
  }
});

// ─── 5. ANIMAÇÃO DA TIMELINE ─────────────────────────
// Demonstra: IntersectionObserver com delay progressivo,
// setTimeout, dataset, estilo dinâmico

const itensTimeline = document.querySelectorAll(".timeline-item");

const observadorTimeline = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("timeline-visivel");
        observadorTimeline.unobserve(entrada.target);
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  },
);

itensTimeline.forEach((item, indice) => {
  // Delay progressivo para efeito cascata
  item.style.transitionDelay = `${indice * 0.12}s`;
  observadorTimeline.observe(item);
});

// ─── 6. PLAYER DE VINIL (Spotify visual) ─────────────
// Demonstra: event delegation, classList manipulation,
// DOM traversal (closest, querySelector),
// estado visual reativo, manipulação de múltiplos
// elementos simultaneamente

/**
 * Gerencia o estado do player de vinil.
 * Quando uma faixa é selecionada:
 * 1. Marca a faixa como ativa (highlight visual)
 * 2. Adiciona classe 'tocando' ao álbum (disco sai e gira)
 * 3. Clicar na mesma faixa pausa/retoma
 * 4. Clicar em outra faixa troca a ativa
 * 5. Trocar de álbum pausa o anterior
 */

const albuns = document.querySelectorAll(".vinil-album");
let albumAtivo = null;
let faixaAtiva = null;

albuns.forEach((album) => {
  const faixas = album.querySelectorAll(".vinil-faixas li");
  const capa = album.querySelector(".vinil-capa");

  // Clique nas faixas da tracklist
  faixas.forEach((faixa) => {
    faixa.addEventListener("click", () => {
      handleFaixaClick(album, faixa);
    });
  });

  // Clique na capa para pausar/retomar
  capa.addEventListener("click", () => {
    handleCapaClick(album);
  });
});

function handleFaixaClick(album, faixa) {
  const todasFaixas = album.querySelectorAll(".vinil-faixas li");

  // Se clicou na mesma faixa que já está ativa
  if (faixa === faixaAtiva) {
    // Toggle entre tocando e pausado
    if (album.classList.contains("tocando")) {
      album.classList.remove("tocando");
      album.classList.add("pausado");
      atualizarBotaoPlay(faixa, "▶");
    } else {
      album.classList.remove("pausado");
      album.classList.add("tocando");
      atualizarBotaoPlay(faixa, "⏸");
    }
    return;
  }

  // Se havia outro álbum tocando, parar
  if (albumAtivo && albumAtivo !== album) {
    pararAlbum(albumAtivo);
  }

  // Limpar faixa anterior no mesmo álbum
  todasFaixas.forEach((f) => {
    f.classList.remove("faixa-ativa");
    atualizarBotaoPlay(f, "▶");
  });

  // Ativar nova faixa
  faixa.classList.add("faixa-ativa");
  atualizarBotaoPlay(faixa, "⏸");

  // Ativar disco girando
  album.classList.remove("pausado");
  album.classList.add("tocando");

  // Atualizar referências
  albumAtivo = album;
  faixaAtiva = faixa;
}

function handleCapaClick(album) {
  if (!album.classList.contains("tocando") && !album.classList.contains("pausado")) {
    // Nenhuma faixa selecionada: tocar a primeira
    const primeiraFaixa = album.querySelector(".vinil-faixas li");
    if (primeiraFaixa) {
      handleFaixaClick(album, primeiraFaixa);
    }
    return;
  }

  if (album.classList.contains("tocando")) {
    album.classList.remove("tocando");
    album.classList.add("pausado");
    if (faixaAtiva) atualizarBotaoPlay(faixaAtiva, "▶");
  } else {
    album.classList.remove("pausado");
    album.classList.add("tocando");
    if (faixaAtiva) atualizarBotaoPlay(faixaAtiva, "⏸");
  }
}

function pararAlbum(album) {
  album.classList.remove("tocando", "pausado");
  album.querySelectorAll(".vinil-faixas li").forEach((f) => {
    f.classList.remove("faixa-ativa");
    atualizarBotaoPlay(f, "▶");
  });
}

function atualizarBotaoPlay(faixa, simbolo) {
  const botao = faixa.querySelector(".faixa-play");
  if (botao) botao.textContent = simbolo;
}

// ─── 7. HEADER COMPACTO NO SCROLL ───────────────────
// Demonstra: window scroll event, classList manipulation
// baseada em condição (scrollY), performance com
// variável de controle

let headerCompacto = false;
const cabecalho = document.querySelector(".cabecalho-site");

window.addEventListener("scroll", () => {
  const deveFicarCompacto = window.scrollY > 120;

  if (deveFicarCompacto !== headerCompacto) {
    headerCompacto = deveFicarCompacto;
    cabecalho.style.padding = headerCompacto ? "0" : "";
    cabecalho.style.boxShadow = headerCompacto
      ? "0 4px 30px rgba(0, 0, 0, 0.4)"
      : "";
  }
});

// ─── 8. SMOOTH SCROLL PARA ÂNCORAS ──────────────────
// Demonstra: preventDefault, querySelector dinâmico,
// scrollIntoView com opções, getAttribute

document.querySelectorAll('a[href^="#"]').forEach((ancora) => {
  ancora.addEventListener("click", (evento) => {
    const destino = document.querySelector(ancora.getAttribute("href"));
    if (destino) {
      evento.preventDefault();
      destino.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// ─── 9. DETECÇÃO DE PROTOCOLO — AVISO SPOTIFY ──────
// Demonstra: window.location.protocol, manipulação
// condicional de visibilidade de elementos,
// style.display

const avisoServidor = document.getElementById("aviso-servidor");

if (avisoServidor) {
  if (window.location.protocol === "file:") {
    // Aberto via file:// → mostrar aviso
    avisoServidor.style.display = "block";
  } else {
    // Aberto via http:// ou https:// → ocultar aviso
    avisoServidor.style.display = "none";
  }
}
