/* Accessible request preview. No timer, popup automation or network request. */
(function () {
  'use strict';

  window.GerberRequests = {
    init: function (options) {
      if (document.getElementById('request-dialog')) return;
      var dialog = document.createElement('dialog');
      dialog.id = 'request-dialog';
      dialog.className = 'request-dialog';
      dialog.setAttribute('aria-labelledby', 'request-title');
      dialog.innerHTML =
        '<div class="request-heading"><div><p class="request-eyebrow">Dein nächstes Set</p>' +
        '<h2 id="request-title">Deine Anfrage an Sophie</h2></div>' +
        '<button type="button" class="request-close" aria-label="Anfrage schließen">&times;</button></div>' +
        '<p class="request-intro">Noch keine Buchung: Den Termin und den endgültigen Preis vereinbarst du persönlich mit Sophie.</p>' +
        '<label for="request-text">Deine Nachricht</label>' +
        '<textarea id="request-text" rows="8" readonly></textarea>' +
        '<p id="request-status" role="status" aria-live="polite" aria-atomic="true"></p>' +
        '<button type="button" class="btn btn-line request-copy">Nachricht kopieren</button>' +
        '<div class="request-actions">' +
        '<a class="btn btn-solid" href="https://ig.me/m/gerberxnails" target="_blank" rel="noopener noreferrer">Instagram öffnen ↗</a>' +
        '<a class="btn btn-line request-email" href="mailto:gerberxnails@gmx.de">Per E-Mail anfragen</a></div>' +
        '<p class="request-help">Instagram: Nachricht ins Textfeld einfügen und senden. Bei E-Mail ist sie bereits eingetragen.</p>';
      // Native links remain usable if this browser does not support modal dialogs.
      if (typeof dialog.showModal !== 'function') return;
      document.body.appendChild(dialog);
      var field = dialog.querySelector('textarea');
      var status = dialog.querySelector('#request-status');
      var copy = dialog.querySelector('.request-copy');
      var opener = null, attempt = 0;

      function copyMessage() {
        var current = ++attempt;
        copy.disabled = true;
        status.textContent = 'Nachricht wird kopiert …';
        Promise.resolve().then(function () { return options.copy(field.value); }).then(function (ok) {
          if (current !== attempt || !dialog.open) return;
          copy.disabled = false;
          status.textContent = ok
            ? 'Kopiert. Öffne Instagram und füge die Nachricht dort ein.'
            : 'Automatisches Kopieren ist nicht möglich. Kopiere den markierten Text oder wähle E-Mail.';
          if (!ok) { field.focus(); field.select(); }
        }, function () {
          if (current !== attempt || !dialog.open) return;
          copy.disabled = false;
          status.textContent = 'Bitte kopiere den markierten Text oder wähle E-Mail.';
          field.focus(); field.select();
        });
      }

      document.addEventListener('click', function (event) {
        var trigger = event.target.closest('[data-send]');
        if (!trigger || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        var closeMenu = document.querySelector('#menu.open #menu-close-btn');
        if (closeMenu) closeMenu.click();
        opener = trigger;
        field.value = options.message(trigger.getAttribute('data-send'));
        dialog.querySelector('.request-email').href = 'mailto:gerberxnails@gmx.de?subject=' +
          encodeURIComponent('Terminanfrage – gerberxnails') + '&body=' + encodeURIComponent(field.value);
        status.textContent = 'Kopiere deine Nachricht für Instagram oder sende sie direkt per E-Mail.';
        copy.disabled = false;
        dialog.showModal();
        copy.focus();
      });
      copy.addEventListener('click', copyMessage);
      dialog.querySelector('.request-close').addEventListener('click', function () { dialog.close(); });
      dialog.addEventListener('click', function (event) {
        if (event.target !== dialog) return;
        var bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
      });
      dialog.addEventListener('close', function () {
        attempt++;
        if (opener && opener.isConnected) opener.focus({ preventScroll: true });
      });
    }
  };
})();
