/* 站点配置与页面逻辑 —— 你只需要改下面这一个 SITE 对象 */
(function () {
  'use strict';

  var SITE = {
    name: '智能车手记',
    tagline: '一个普通学生和一辆小车的故事：备赛、调车、翻车、再爬起来的全过程记录。',
    author: '你的名字',
    github: ''        // 例如 'https://github.com/yourname'，留空则不显示
  };

  /* ---------------- 工具 ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function fmtDate(d) {
    var parts = String(d).split('-');
    if (parts.length < 3) return d;
    return parts[0] + '.' + parts[1] + '.' + parts[2];
  }

  function fmtCn(d) {
    var parts = String(d).split('-');
    if (parts.length < 3) return d;
    return parts[0] + ' 年 ' + Number(parts[1]) + ' 月 ' + Number(parts[2]) + ' 日';
  }

  function esc(s) { return window.md ? window.md.escape(s) : String(s); }

  /* ---------------- 主题 ---------------- */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) {}
    var btn = $('#theme-toggle');
    if (btn) {
      btn.textContent = t === 'dark' ? '☀' : '☾';
      btn.setAttribute('aria-label', t === 'dark' ? '切换到浅色模式' : '切换到深色模式');
    }
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) {}
    var t = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(t);
    var btn = $('#theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      });
    }
  }

  /* ---------------- 站点公共信息 ---------------- */
  function initSite() {
    $$('[data-site-name]').forEach(function (el) { el.textContent = SITE.name; });
    $$('[data-site-tagline]').forEach(function (el) { el.textContent = SITE.tagline; });
    $$('[data-author]').forEach(function (el) { el.textContent = SITE.author; });
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    if (SITE.github) {
      $$('[data-github]').forEach(function (el) {
        el.href = SITE.github;
        el.textContent = SITE.github.replace(/^https?:\/\//, '').replace(/\/$/, '');
      });
      $$('[data-github-wrap]').forEach(function (el) { el.hidden = false; });
    }
  }

  /* ---------------- 数据 ---------------- */
  function loadIndex() {
    return fetch('posts/index.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (list) {
        return list
          .filter(function (p) { return p && p.slug && p.title; })
          .sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0); });
      });
  }

  function fetchError(err) {
    return '<p class="empty">文章目录读取失败（' + esc(err.message || String(err)) +
      '）。<br>如果你是用 <code>file://</code> 直接双击打开的页面，浏览器会拦截 fetch，' +
      '请改用本地服务器或部署到 GitHub Pages 后再看。</p>';
  }

  /* ---------------- 首页 ---------------- */
  function renderIndex(posts) {
    var listEl = $('#post-list');
    var tagBar = $('#tag-bar');
    if (!listEl) return;

    if (!posts.length) {
      listEl.innerHTML = '<p class="empty">还没有文章。在 <code>posts/</code> 里新建一篇，' +
        '再往 <code>posts/index.json</code> 加一行就行。</p>';
      return;
    }

    // 顶部信息条
    var strip = $('#meta-strip');
    if (strip) {
      strip.innerHTML =
        '<span>共 <b>' + posts.length + '</b> 篇</span>' +
        '<span>最近更新 <b>' + fmtDate(posts[0].date) + '</b></span>' +
        '<span>始于 <b>' + fmtDate(posts[posts.length - 1].date) + '</b></span>';
    }

    // 标签栏
    var tags = [];
    posts.forEach(function (p) {
      (p.tags || []).forEach(function (t) { if (tags.indexOf(t) < 0) tags.push(t); });
    });

    var active = null;

    function draw() {
      var shown = active ? posts.filter(function (p) { return (p.tags || []).indexOf(active) >= 0; }) : posts;
      var html = '';
      var year = null;

      shown.forEach(function (p) {
        var y = String(p.date).slice(0, 4);
        if (y !== year) {
          if (year !== null) html += '</div>';
          html += '<div class="year-group"><div class="year-label">' + esc(y) + '</div>';
          year = y;
        }
        html += '<a class="post-card" href="post.html?p=' + encodeURIComponent(p.slug) + '">' +
          '<time datetime="' + esc(p.date) + '">' + fmtDate(p.date) + '</time>' +
          '<h2>' + esc(p.title) + '</h2>' +
          (p.summary ? '<p>' + esc(p.summary) + '</p>' : '') +
          ((p.tags && p.tags.length)
            ? '<div class="card-tags">' + p.tags.map(function (t) {
                return '<span class="tag">' + esc(t) + '</span>';
              }).join('') + '</div>'
            : '') +
          '</a>';
      });
      if (year !== null) html += '</div>';
      if (!shown.length) html = '<p class="empty">这个标签下还没有文章。</p>';
      listEl.innerHTML = html;
    }

    if (tags.length) {
      tagBar.innerHTML = ['<span class="tag" data-tag="">全部</span>']
        .concat(tags.map(function (t) {
          return '<span class="tag" data-tag="' + esc(t) + '">' + esc(t) + '</span>';
        })).join('');
      tagBar.addEventListener('click', function (e) {
        var el = e.target.closest('.tag');
        if (!el) return;
        active = el.getAttribute('data-tag') || null;
        $$('.tag', tagBar).forEach(function (t) { t.classList.toggle('on', t === el); });
        draw();
      });
      $$('.tag', tagBar)[0].classList.add('on');
    } else {
      tagBar.hidden = true;
    }

    draw();
  }

  /* ---------------- 文章页 ---------------- */
  function renderPost(posts) {
    var host = $('#post');
    if (!host) return;

    var slug = new URLSearchParams(location.search).get('p');
    var idx = -1;
    posts.forEach(function (p, i) { if (p.slug === slug) idx = i; });

    if (idx < 0) {
      document.title = '没有找到这篇文章 · ' + SITE.name;
      host.innerHTML = '<p class="empty">没有找到这篇文章：<code>' + esc(slug || '(缺少 ?p= 参数)') +
        '</code><br><a href="index.html">← 回到文章列表</a></p>';
      return;
    }

    var post = posts[idx];
    document.title = post.title + ' · ' + SITE.name;

    function nav(target, dir) {
      if (!target) return '<span class="disabled"></span>';
      return '<a class="' + dir + '" href="post.html?p=' + encodeURIComponent(target.slug) + '">' +
        '<span class="dir">' + (dir === 'prev' ? '← 上一篇' : '下一篇 →') + '</span>' +
        esc(target.title) + '</a>';
    }

    host.innerHTML =
      '<header class="article-head">' +
        '<div class="kicker"><time datetime="' + esc(post.date) + '">' + fmtCn(post.date) + '</time></div>' +
        '<h1>' + esc(post.title) + '</h1>' +
        ((post.tags && post.tags.length)
          ? '<div class="card-tags">' + post.tags.map(function (t) {
              return '<span class="tag">' + esc(t) + '</span>';
            }).join('') + '</div>'
          : '') +
      '</header>' +
      '<div class="prose" id="prose"><p class="loading">正文加载中</p></div>';

    fetch('posts/' + encodeURIComponent(slug) + '.md', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (text) {
        var prose = $('#prose');
        prose.innerHTML = window.md.render(text);
        var navEl = document.createElement('nav');
        navEl.className = 'post-nav';
        // posts 是倒序（新→旧），所以上一篇是 idx-1
        navEl.innerHTML = nav(posts[idx - 1], 'prev') + nav(posts[idx + 1], 'next');
        host.appendChild(navEl);
        bindLightbox();
      })
      .catch(function (err) {
        $('#prose').innerHTML = '<p class="empty">正文读取失败：' + esc(err.message) + '</p>';
      });
  }

  /* ---------------- 图片灯箱 ---------------- */
  function bindLightbox() {
    var box = $('#lightbox');
    if (!box) return;
    var img = box.querySelector('img');

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t.tagName === 'IMG' && t.closest('.prose')) {
        img.src = t.currentSrc || t.src;
        img.alt = t.alt || '';
        box.classList.add('open');
      }
    });

    function close() { box.classList.remove('open'); img.removeAttribute('src'); }
    box.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ---------------- 启动 ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initSite();
    bindLightbox();

    if ($('#post-list') || $('#post')) {
      loadIndex()
        .then(function (posts) {
          renderIndex(posts);
          renderPost(posts);
        })
        .catch(function (err) {
          var el = $('#post-list') || $('#post');
          if (el) el.innerHTML = fetchError(err);
        });
    }
  });
})();
