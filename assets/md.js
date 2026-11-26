/* 极简 Markdown 渲染器（零依赖，够写博客用）
 * 支持：# 标题 / 段落 / **粗体** / *斜体* / ~~删除线~~ / `代码` / 代码块
 *       > 引用 / - 无序列表 / 1. 有序列表 / 表格 / 分隔线 / 链接 / 图片
 */
(function (global) {
  'use strict';

  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return ESC[c]; });
  }

  // 生成锚点 id：保留中文、字母、数字
  function slug(s) {
    return s.toLowerCase()
      .replace(/<[^>]+>/g, '')
      .replace(/[^\w\u4e00-\u9fa5\- ]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  function inline(text) {
    var codes = [];
    // 先占位行内代码，避免里面的 * _ 被当成语法
    text = text.replace(/`([^`]+)`/g, function (m, c) {
      codes.push('<code>' + c + '</code>');
      return '\u0000C' + (codes.length - 1) + '\u0000';
    });
    // 图片
    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, function (m, alt, src, title) {
      return '<img src="' + src + '" alt="' + alt + '"' +
        (title ? ' title="' + title + '"' : '') + ' loading="lazy" decoding="async">';
    });
    // 链接
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, function (m, label, href, title) {
      var ext = /^https?:/i.test(href);
      return '<a href="' + href + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') +
        (title ? ' title="' + title + '"' : '') + '>' + label + '</a>';
    });
    // 粗体 / 斜体 / 删除线
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    text = text.replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    // 还原行内代码
    return text.replace(/\u0000C(\d+)\u0000/g, function (m, i) { return codes[+i]; });
  }

  function isBlockStart(line) {
    return /^\s*(#{1,6}\s|```|>|[-*+]\s|\d+\.\s)/.test(line) ||
      /^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line) ||
      /^\s*@bilibili\s/i.test(line) ||
      /^\s*\|/.test(line);
  }

  function parse(src) {
    var lines = String(src).replace(/\r\n?/g, '\n').split('\n');
    var out = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      if (/^\s*$/.test(line)) { i++; continue; }

      // ---- 代码块 ----
      var fence = line.match(/^\s*```\s*([\w+#-]*)\s*$/);
      if (fence) {
        var buf = [];
        i++;
        while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++; // 跳过结束 ```
        out.push('<pre class="code-block"><code' + (fence[1] ? ' class="lang-' + fence[1] + '"' : '') + '>' +
          esc(buf.join('\n')) + '</code></pre>');
        continue;
      }

      // ---- 分隔线 ----
      if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) { out.push('<hr>'); i++; continue; }

      // ---- 标题 ----
      var h = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
      if (h) {
        var lv = h[1].length;
        var txt = inline(esc(h[2]));
        var id = slug(h[2]);
        out.push('<h' + lv + (id ? ' id="' + id + '"' : '') + '>' + txt + '</h' + lv + '>');
        i++;
        continue;
      }

      // ---- B 站视频 ----
      var bi = line.match(/^\s*@bilibili\s+(\S+)\s*$/i);
      if (bi) {
        var bv = (bi[1].match(/BV[0-9A-Za-z]+/) || [bi[1]])[0];
        out.push('<div class="video-wrap"><iframe src="https://player.bilibili.com/player.html?bvid=' +
          bv + '&page=1&high_quality=1&danmaku=0" scrolling="no" frameborder="0" ' +
          'allowfullscreen="true" loading="lazy" title="B 站视频 ' + bv + '"></iframe></div>');
        i++;
        continue;
      }

      // ---- 引用 ----
      if (/^\s*>/.test(line)) {
        var q = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) {
          q.push(lines[i].replace(/^\s*>\s?/, ''));
          i++;
        }
        out.push('<blockquote>' + parse(q.join('\n')) + '</blockquote>');
        continue;
      }

      // ---- 表格 ----
      if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1]) && /-/.test(lines[i + 1])) {
        var rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(lines[i]); i++; }
        var cells = function (r) {
          return r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(function (c) { return c.trim(); });
        };
        var head = cells(rows[0]);
        var body = rows.slice(2).map(cells);
        var html = '<div class="table-wrap"><table><thead><tr>' +
          head.map(function (c) { return '<th>' + inline(esc(c)) + '</th>'; }).join('') +
          '</tr></thead><tbody>';
        body.forEach(function (r) {
          html += '<tr>' + head.map(function (_, k) { return '<td>' + inline(esc(r[k] || '')) + '</td>'; }).join('') + '</tr>';
        });
        out.push(html + '</tbody></table></div>');
        continue;
      }

      // ---- 列表 ----
      var li = line.match(/^\s*([-*+]|\d+\.)\s+(.*)$/);
      if (li) {
        var ordered = /\d+\./.test(li[1]);
        var items = [];
        while (i < lines.length) {
          var m = lines[i].match(/^\s*([-*+]|\d+\.)\s+(.*)$/);
          if (m) { items.push(m[2]); i++; continue; }
          // 列表项的续行（缩进的非空行）
          if (items.length && /^\s{2,}\S/.test(lines[i])) { items[items.length - 1] += '\n' + lines[i].trim(); i++; continue; }
          break;
        }
        var tag = ordered ? 'ol' : 'ul';
        out.push('<' + tag + '>' + items.map(function (t) {
          return '<li>' + inline(esc(t)).replace(/\n/g, '<br>') + '</li>';
        }).join('') + '</' + tag + '>');
        continue;
      }

      // ---- 段落 / 单图 ----
      var para = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !isBlockStart(lines[i])) {
        para.push(lines[i]);
        i++;
      }
      if (!para.length) { i++; continue; }

      var onlyImg = para.length === 1 && /^!\[[^\]]*\]\([^)]+\)$/.test(para[0].trim());
      if (onlyImg) {
        out.push('<figure>' + inline(esc(para[0].trim())) + '</figure>');
      } else {
        out.push('<p>' + para.map(function (t) { return inline(esc(t.trim())); }).join('<br>') + '</p>');
      }
    }

    return out.join('\n');
  }

  global.md = { render: parse, escape: esc };
})(window);
