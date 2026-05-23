/* ============================================================
   AI超级个体训练营 v2.0 · 主脚本
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- 1. 粒子网络背景 ----
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    const PARTICLE_COUNT = 60;
    const CONNECTION_DIST = 140;
    const MOUSE_DIST = 200;

    function resizeCanvas() {
      const hero = canvas.parentElement;
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          r: Math.random() * 2 + 1
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 连线
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 粒子
      particles.forEach(p => {
        // 鼠标交互
        const dmx = p.x - mouse.x;
        const dmy = p.y - mouse.y;
        const mouseDist = Math.sqrt(dmx * dmx + dmy * dmy);
        if (mouseDist < MOUSE_DIST) {
          const alpha = (1 - mouseDist / MOUSE_DIST) * 0.3;
          ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        ctx.fillStyle = `rgba(0, 255, 136, 0.4)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    createParticles();
    drawParticles();
    window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });

    canvas.parentElement.addEventListener('mousemove', e => {
      const rect = canvas.parentElement.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });
  }

  // ---- 2. 滚动渐入动画 ----
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  // ---- 3. 导航栏效果 ----
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', scrollY > 60);
  });

  // ---- 4. 数字递增动画 ----
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      const duration = 1800;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  // ---- 5. 平滑滚动 ----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        const offset = 80; // nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---- 6. FAQ 手风琴 ----
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const wasOpen = item.classList.contains('faq-open');
      // 关闭所有
      document.querySelectorAll('.faq-item.faq-open').forEach(i => i.classList.remove('faq-open'));
      // 切换当前
      if (!wasOpen) item.classList.add('faq-open');
    });
  });

  // ---- 7. 终端打字动效 ----
  const terminalBody = document.querySelector('.terminal-body');
  if (terminalBody) {
    const lines = terminalBody.querySelectorAll('.terminal-line');
    lines.forEach(line => {
      line.style.opacity = '0';
      line.style.transform = 'translateY(8px)';
      line.style.transition = 'opacity 0.4s, transform 0.4s';
    });

    const termObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          lines.forEach((line, i) => {
            setTimeout(() => {
              line.style.opacity = '1';
              line.style.transform = 'translateY(0)';
            }, i * 200);
          });
          termObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });
    termObserver.observe(terminalBody);
  }

  // ---- 8. 能力面板 Tab 切换 ----
  const capTabs = document.querySelectorAll('.cap-tab');
  const capDetails = document.querySelectorAll('.cap-detail');

  function switchCap(index) {
    capTabs.forEach(t => t.classList.remove('active'));
    capDetails.forEach(d => d.classList.remove('active'));

    const targetTab = document.querySelector(`.cap-tab[data-cap="${index}"]`);
    const targetDetail = document.querySelector(`.cap-detail[data-cap-detail="${index}"]`);

    if (targetTab) targetTab.classList.add('active');
    if (targetDetail) targetDetail.classList.add('active');
  }

  capTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const index = parseInt(tab.dataset.cap);
      switchCap(index);
    });
  });

  // 能力面板自动轮播（仅在视口内且无手动交互时）
  let capAutoTimer = null;
  let capManualInteract = false;
  let currentCap = 0;

  function startCapAuto() {
    if (capManualInteract) return;
    capAutoTimer = setInterval(() => {
      currentCap = (currentCap + 1) % 6;
      switchCap(currentCap);
    }, 4000);
  }

  function stopCapAuto() {
    if (capAutoTimer) {
      clearInterval(capAutoTimer);
      capAutoTimer = null;
    }
  }

  // 观察能力面板进入视口
  const capPanel = document.querySelector('.cap-panel');
  if (capPanel) {
    const capPanelObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !capManualInteract) {
          startCapAuto();
        } else {
          stopCapAuto();
        }
      });
    }, { threshold: 0.2 });
    capPanelObserver.observe(capPanel);

    // 用户点击tab后停止自动轮播
    capTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        capManualInteract = true;
        stopCapAuto();
        currentCap = parseInt(tab.dataset.cap);
      });
    });
  }

  // ---- 9. 痛点卡片鼠标跟随发光 ----
  document.querySelectorAll('.pain-card').forEach(card => {
    const glow = card.querySelector('.pain-card-glow');
    if (!glow) return;

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.left = x + 'px';
      glow.style.top = y + 'px';
    });
  });

  // ---- 10. 滚动触发的文字渐显 ----
  document.querySelectorAll('.quote-text').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
  });

  const quoteObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        quoteObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.quote-text').forEach(el => quoteObserver.observe(el));

  // ---- 11. 课程路线图（已改为展开式，无需交互） ----
  // 阶段切换和周手风琴逻辑已移除（V2.3 改为全部展开的路线图布局）

  // ---- 12. 路线图卡片hover微交互 ----
  document.querySelectorAll('.roadmap-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-3px) translateX(4px)';
      card.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25), 0 0 20px rgba(var(--accent-rgb), 0.05)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });

  // ---- 13. 成长路径地图阶段hover效果 ----
  document.querySelectorAll('.gm-phase-node').forEach(node => {
    node.addEventListener('mouseenter', () => {
      // 高亮同阶段的所有skill
      const phase = node.closest('.gm-phase');
      if (phase) {
        phase.querySelectorAll('.gm-skill').forEach(skill => {
          skill.style.borderColor = 'var(--border-accent)';
          skill.style.color = 'var(--accent)';
          skill.style.transform = 'translateY(-2px)';
        });
      }
    });
    node.addEventListener('mouseleave', () => {
      const phase = node.closest('.gm-phase');
      if (phase) {
        phase.querySelectorAll('.gm-skill').forEach(skill => {
          skill.style.borderColor = '';
          skill.style.color = '';
          skill.style.transform = '';
        });
      }
    });
  });

  // ---- 14. 痛点卡片点击展开 ----
  document.querySelectorAll('.pain-card').forEach(card => {
    card.addEventListener('click', () => {
      const isOpen = card.classList.contains('pain-open');
      // 关闭所有其他
      document.querySelectorAll('.pain-card.pain-open').forEach(c => {
        if (c !== card) c.classList.remove('pain-open');
      });
      card.classList.toggle('pain-open', !isOpen);
    });
  });

  // ---- 15. 价值堆叠动画 ----
  const valueStackItems = document.querySelectorAll('.vs-item');
  if (valueStackItems.length > 0) {
    const stackObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          valueStackItems.forEach((item, i) => {
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, i * 120);
          });
          stackObserver.disconnect();
        }
      });
    }, { threshold: 0.2 });
    valueStackItems.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(16px)';
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    const stack = document.querySelector('.value-stack');
    if (stack) stackObserver.observe(stack);
  }

  // ---- 16. 评价卡片交错hover ----
  document.querySelectorAll('.testimonial-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-6px) scale(1.02)';
      card.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });

  // ---- 17. 稀缺标签微动 ----
  document.querySelectorAll('.scarcity-tag').forEach((tag, i) => {
    tag.style.animationDelay = `${i * 0.5}s`;
    tag.addEventListener('mouseenter', () => {
      tag.style.background = 'rgba(var(--accent-rgb), 0.15)';
      tag.style.transform = 'scale(1.05)';
    });
    tag.addEventListener('mouseleave', () => {
      tag.style.background = '';
      tag.style.transform = '';
    });
  });

  // ---- 19. 全屏翻页键盘交互 ----
  const sections = Array.from(document.querySelectorAll('.section'));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      // Find current section index
      let currentIdx = sections.findIndex(sec => {
        const rect = sec.getBoundingClientRect();
        return rect.top >= -10 && rect.top <= 100; // rough check for currently snapped
      });
      if (currentIdx === -1) {
        // Fallback, find the one closest to top
        let minDiff = Infinity;
        sections.forEach((sec, idx) => {
          const diff = Math.abs(sec.getBoundingClientRect().top);
          if (diff < minDiff) { minDiff = diff; currentIdx = idx; }
        });
      }
      if (currentIdx < sections.length - 1) {
        sections[currentIdx + 1].scrollIntoView({ behavior: 'smooth' });
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      let currentIdx = sections.findIndex(sec => {
        const rect = sec.getBoundingClientRect();
        return rect.top >= -10 && rect.top <= 100;
      });
      if (currentIdx === -1) {
        let minDiff = Infinity;
        sections.forEach((sec, idx) => {
          const diff = Math.abs(sec.getBoundingClientRect().top);
          if (diff < minDiff) { minDiff = diff; currentIdx = idx; }
        });
      }
      if (currentIdx > 0) {
        sections[currentIdx - 1].scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

});
