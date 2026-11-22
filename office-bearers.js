(function () {
  'use strict';

  // Edit names and roles here. Put portraits in: images/office-bearers/
  // Example photo: "images/office-bearers/president.jpg"
  var officeBearers = [
    { name: 'Office Bearer 1', role: 'President', photo: '' },
    { name: 'Office Bearer 2', role: 'Vice President', photo: '' },
    { name: 'Office Bearer 3', role: 'Secretary', photo: '' },
    { name: 'Office Bearer 4', role: 'Joint Secretary', photo: '' },
    { name: 'Office Bearer 5', role: 'Treasurer', photo: '' },
    { name: 'Office Bearer 6', role: 'SDP Coordinator', photo: '' },
    { name: 'Office Bearer 7', role: 'OTech Coordinator', photo: '' },
    { name: 'Office Bearer 8', role: 'Creative Lead', photo: '' },
    { name: 'Office Bearer 9', role: 'Technical Lead', photo: '' },
    { name: 'Office Bearer 10', role: 'Event Coordinator', photo: '' },
    { name: 'Office Bearer 11', role: 'Public Relations Lead', photo: '' },
    { name: 'Office Bearer 12', role: 'Media Coordinator', photo: '' },
    { name: 'Office Bearer 13', role: 'Volunteer Coordinator', photo: '' }
  ];

  var carousel = document.getElementById('officeCarousel');
  var track = document.getElementById('officeCarouselTrack');
  if (!carousel || !track) return;

  var cards = officeBearers.map(function (member, index) {
    var card = document.createElement('article');
    card.className = 'office-bearer-card';
    card.setAttribute('aria-label', member.name + ', ' + member.role);

    if (member.photo) {
      var image = document.createElement('img');
      image.src = member.photo;
      image.alt = member.name;
      image.loading = 'lazy';
      image.decoding = 'async';
      card.appendChild(image);
    } else {
      var fallback = document.createElement('div');
      fallback.className = 'office-bearer-fallback';
      fallback.textContent = String(index + 1).padStart(2, '0');
      card.appendChild(fallback);
    }

    var info = document.createElement('div');
    info.className = 'office-bearer-info';
    var name = document.createElement('h3');
    name.textContent = member.name;
    var role = document.createElement('p');
    role.textContent = member.role;
    info.append(name, role);
    card.appendChild(info);
    track.appendChild(card);
    return card;
  });

  var pitch = 196;
  var position = 0;
  var velocity = 0;
  var dragging = false;
  var lastX = 0;
  var lastTime = 0;
  var cursorInfluence = 0;
  var cursorTarget = 0;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render() {
    var rect = carousel.getBoundingClientRect();
    var center = rect.width / 2;
    var bandHeight = rect.height;
    var loopWidth = pitch * cards.length;
    cursorInfluence += (cursorTarget - cursorInfluence) * 0.08;

    cards.forEach(function (card, index) {
      var offset = (index - (cards.length - 1) / 2) * pitch + position + cursorInfluence;
      while (offset < -loopWidth / 2) offset += loopWidth;
      while (offset > loopWidth / 2) offset -= loopWidth;

      var pushed = center + offset * (1 + 0.083 * Math.pow(Math.abs(offset) / 706, 2));
      var distance = Math.abs(pushed - center) / 706;
      var leftHeight = 280 + 92 * Math.pow(Math.abs(pushed - center - 85) / 706, 2.6);
      var rightHeight = 280 + 92 * Math.pow(Math.abs(pushed - center + 85) / 706, 2.6);
      var width = 170 + 48 * distance * distance;
      var height = (leftHeight + rightHeight) / 2;
      var slope = rightHeight - leftHeight;
      var rotation = Math.max(-14, Math.min(14, (pushed - center) * 0.025));

      card.style.width = width + 'px';
      card.style.height = height + 'px';
      card.style.marginLeft = (-width / 2) + 'px';
      card.style.marginTop = (-height / 2) + 'px';
      card.style.left = pushed + 'px';
      card.style.top = (bandHeight / 2) + 'px';
      card.style.transform = 'rotateZ(' + rotation + 'deg) skewY(' + (slope * 0.018) + 'deg) scale(' +
        Math.max(.82, 1 - distance * .10) + ')';
      card.style.zIndex = String(100 - Math.round(distance * 100));
      card.style.opacity = Math.abs(pushed - center) > rect.width * .58 ? '0.12' : '1';
    });
  }

  function tick(time) {
    var now = time || performance.now();
    if (!tick.lastTime) tick.lastTime = now;
    var elapsed = Math.min(.05, (now - tick.lastTime) / 1000);
    tick.lastTime = now;

    if (!dragging) {
      if (!reducedMotion) position -= 58 * elapsed;
      if (Math.abs(velocity) > .02) {
        position += velocity * elapsed;
        velocity *= Math.pow(.95, elapsed);
      } else {
        velocity = 0;
      }
    }
    render();
    requestAnimationFrame(tick);
  }

  function startDrag(event) {
    if (event.button !== undefined && event.button !== 0) return;
    dragging = true;
    lastX = event.clientX;
    lastTime = performance.now();
    velocity = 0;
    carousel.classList.add('is-dragging');
    if (carousel.setPointerCapture) carousel.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
    if (!dragging) return;
    var now = performance.now();
    var delta = event.clientX - lastX;
    var elapsed = Math.max(8, now - lastTime);
    position += delta;
    velocity = delta / elapsed * 16;
    lastX = event.clientX;
    lastTime = now;
  }

  function endDrag() {
    dragging = false;
    carousel.classList.remove('is-dragging');
  }

  carousel.addEventListener('pointerdown', startDrag);
  carousel.addEventListener('pointermove', moveDrag);
  carousel.addEventListener('pointerup', endDrag);
  carousel.addEventListener('pointercancel', endDrag);
  carousel.addEventListener('pointermove', function (event) {
    if (dragging) return;
    var rect = carousel.getBoundingClientRect();
    cursorTarget = ((event.clientX - rect.left) / rect.width - .5) * 24;
  });
  carousel.addEventListener('pointerleave', function () { cursorTarget = 0; });
  window.addEventListener('resize', render);
  render();
  if (!reducedMotion) requestAnimationFrame(tick);
})();
