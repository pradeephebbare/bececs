/* Renders the Semester Toppers page from window.TOPPERS_DATA (see toppers-data.js).
   Uses DOM methods + textContent only (no innerHTML), so it is safe under the site's CSP. */
(function () {
  'use strict';
  var data = window.TOPPERS_DATA || [];
  var root = document.getElementById('toppersRoot');
  var jump = document.getElementById('batchJump');
  if (!root) return;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  var plural = function (n) { return n + (n === 1 ? ' topper' : ' toppers'); };

  function studentCard(s, batchLabel, semLabel) {
    var li = el('li', 'tp-card' + (s.rank === 1 ? ' tp-card-first' : ''));
    var photo = el('div', 'tp-photo');
    var img = document.createElement('img');
    img.src = s.photo; img.alt = s.alt || ('Photo of ' + s.name);
    img.width = 240; img.height = 240; img.loading = 'lazy'; img.decoding = 'async';
    photo.append(img);
    if (s.sample) photo.append(el('span', 'tp-tag', 'Sample photo'));

    var body = el('div', 'tp-body');
    body.append(el('span', 'tp-rank', 'Rank ' + s.rank));
    var h = el('h5', 'tp-name', s.name);
    body.append(h);
    var dl = el('dl', 'tp-facts');
    var a = el('div'); a.append(el('dt', null, 'USN'), el('dd', 'tp-usn', s.usn));
    var b = el('div'); b.append(el('dt', null, 'SGPA'), el('dd', 'tp-sgpa', s.sgpa));
    dl.append(a, b);
    body.append(dl);
    if (s.sample) body.append(el('p', 'tp-sample-line', 'Sample details'));

    li.setAttribute('aria-label', batchLabel + ', ' + semLabel + ', rank ' + s.rank);
    li.append(photo, body);
    return li;
  }

  data.forEach(function (batch) {
    var total = batch.semesters.reduce(function (t, s) { return t + s.students.length; }, 0);
    var sec = el('section', 'tp-batch tp-' + batch.theme);
    sec.id = batch.id;
    sec.hidden = true;
    var hid = batch.id + '-heading';
    sec.setAttribute('aria-labelledby', hid);

    var head = el('header', 'tp-batch-head');
    var hl = el('div');
    hl.append(el('p', 'tp-eyebrow', 'Batch'));
    var h2 = el('h2', 'tp-batch-title', batch.label); h2.id = hid;
    hl.append(h2);
    var meta = el('p', 'tp-batch-meta', batch.semesters.length + ' semesters \u00b7 ' + total + ' toppers');
    head.append(hl, meta);
    sec.append(head);

    var grid = el('div', 'tp-sem-grid');
    batch.semesters.forEach(function (sem) {
      var card = el('section', 'tp-sem');
      var sid = batch.id + '-sem-' + sem.number;
      card.setAttribute('aria-labelledby', sid);
      var sh = el('div', 'tp-sem-head');
      var h3 = el('h3', 'tp-sem-title', sem.label); h3.id = sid;
      sh.append(h3, el('span', 'tp-count', plural(sem.students.length)));
      card.append(sh);
      var list = el('ol', 'tp-list');
      sem.students.forEach(function (s) { list.append(studentCard(s, batch.label, sem.label)); });
      card.append(list);
      grid.append(card);
    });
    sec.append(grid);
    root.append(sec);

    if (jump) {
      var li = document.createElement('li');
      var link = el('a', 'tp-jump-link tp-' + batch.theme, batch.label);
      link.href = '#' + batch.id;
      link.setAttribute('data-batch-id', batch.id);
      link.setAttribute('aria-controls', batch.id);
      link.setAttribute('role', 'tab');
      li.append(link); jump.append(li);
    }
  });

  function selectBatch(id, updateHash) {
    var match = data.filter(function (batch) { return batch.id === id; });
    var selectedId = match.length ? id : (data[0] && data[0].id);
    if (!selectedId) return;

    data.forEach(function (batch) {
      var section = document.getElementById(batch.id);
      if (section) section.hidden = batch.id !== selectedId;
    });

    if (jump) {
      jump.querySelectorAll('[data-batch-id]').forEach(function (link) {
        var active = link.getAttribute('data-batch-id') === selectedId;
        link.classList.toggle('is-active', active);
        link.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    if (updateHash) {
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '#' + selectedId);
      } else {
        window.location.hash = selectedId;
      }
    }
  }

  if (jump) {
    jump.querySelectorAll('[data-batch-id]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        selectBatch(link.getAttribute('data-batch-id'), true);
      });
    });
  }

  var initialId = window.location.hash ? window.location.hash.slice(1) : null;
  selectBatch(initialId, false);

  window.addEventListener('hashchange', function () {
    selectBatch(window.location.hash.slice(1), false);
  });

  var notice = document.getElementById('sampleNotice');
  if (notice && window.SAMPLE_NOTICE_VISIBLE === false) notice.hidden = true;
})();
