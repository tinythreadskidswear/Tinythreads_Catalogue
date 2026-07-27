(function () {
  'use strict';

  function resolveRail(target) {
    return typeof target === 'string' ? document.getElementById(target) : target;
  }

  function bindDragScroll(rail) {
    if (!rail || rail.dataset.ttClearanceDragBound === 'true') return;
    rail.dataset.ttClearanceDragBound = 'true';

    var pointerId = null;
    var startX = 0;
    var startY = 0;
    var startScrollLeft = 0;
    var isDragging = false;
    var suppressClick = false;

    function finishDrag(event) {
      if (pointerId === null || (event && event.pointerId !== pointerId)) return;
      if (isDragging) {
        suppressClick = true;
        rail.classList.remove('is-dragging');
      }
      if (rail.hasPointerCapture && rail.hasPointerCapture(pointerId)) {
        rail.releasePointerCapture(pointerId);
      }
      pointerId = null;
      isDragging = false;
    }

    rail.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (event.pointerType === 'mouse') event.preventDefault();
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startScrollLeft = rail.scrollLeft;
      isDragging = false;
      suppressClick = false;
      if (rail.setPointerCapture) rail.setPointerCapture(pointerId);
    });
    rail.addEventListener('dragstart', function (event) {
      event.preventDefault();
    });

    rail.addEventListener('pointermove', function (event) {
      if (event.pointerId !== pointerId) return;
      var deltaX = event.clientX - startX;
      var deltaY = event.clientY - startY;

      if (!isDragging) {
        if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          finishDrag(event);
          return;
        }
        isDragging = true;
        rail.classList.add('is-dragging');
      }

      rail.scrollLeft = startScrollLeft - deltaX;
      event.preventDefault();
    }, { passive: false });

    rail.addEventListener('pointerup', finishDrag);
    rail.addEventListener('pointercancel', finishDrag);
    rail.addEventListener('lostpointercapture', function () {
      pointerId = null;
      isDragging = false;
      rail.classList.remove('is-dragging');
    });
    rail.addEventListener('click', function (event) {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
  }

  function restoreDirectCards(rail) {
    if (!rail) return;
    if (rail.swiper && typeof rail.swiper.destroy === 'function') {
      rail.swiper.destroy(true, true);
    }

    var wrapper = Array.prototype.slice.call(rail.children).find(function (child) {
      return child.classList && child.classList.contains('swiper-wrapper');
    });
    if (wrapper) {
      var cards = Array.prototype.slice.call(wrapper.children).map(function (slide) {
        return slide.querySelector('.tt-product-card');
      }).filter(Boolean);
      rail.replaceChildren();
      cards.forEach(function (card) { rail.appendChild(card); });
    }

    rail.classList.remove('swiper', 'swiper-initialized', 'swiper-horizontal', 'swiper-backface-hidden');
    rail.style.removeProperty('overflow');
    rail.style.removeProperty('touch-action');
  }

  function destroy(target) {
    restoreDirectCards(resolveRail(target));
  }

  function refresh(target) {
    var rail = resolveRail(target);
    if (!rail) return;
    restoreDirectCards(rail);
    bindDragScroll(rail);
    rail.scrollLeft = 0;
  }

  function refreshAll() {
    document.querySelectorAll('#page-clearance .clearance-carousel').forEach(function (rail) {
      bindDragScroll(rail);
      var hasWrapper = Array.prototype.slice.call(rail.children).some(function (child) {
        return child.classList && child.classList.contains('swiper-wrapper');
      });
      if (rail.swiper || hasWrapper) restoreDirectCards(rail);
    });
  }

  window.addEventListener('tt:pageshown', function (event) {
    if (event.detail && event.detail.id === 'clearance') {
      requestAnimationFrame(refreshAll);
    }
  });

  window.TTClearanceCarousel = {
    destroy: destroy,
    refresh: refresh,
    refreshAll: refreshAll,
    bindDragScroll: bindDragScroll
  };
})();
