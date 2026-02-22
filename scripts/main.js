(function ($) {
    'use strict';

    // Escape user input for use in RegExp
    function escapeRegExp(str) {
        return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Small Bootstrap-styled transient alert (jQuery-only)
    function showAlert(message) {
        var $alert = $('<div>')
            .addClass('alert alert-warning shadow')
            .attr('role', 'alert')
            .text(message)
            .css({ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1080 })
            .hide()
            .appendTo('body')
            .fadeIn(200)
            .delay(2200)
            .fadeOut(200, function () { $(this).remove(); });
        return $alert;
    }

    $(function () {
        var $window = $(window);
        var $document = $(document);
        var $body = $('body');

        var $searchForm = $('#searchForm');
        var $searchInput = $('#searchInput');
        var $backToTopBtn = $('#backToTopBtn');

        // Search and highlight
        if ($searchForm.length && $searchInput.length) {
            $searchForm.on('submit', function (e) {
                e.preventDefault();

                var query = $.trim($searchInput.val() || '');
                if (!query) {
                    return;
                }

                // Remove previous highlights (jQuery-only)
                $body.find('.highlight-search').each(function () {
                    var $span = $(this);
                    var txt = $span.text();
                    $span.replaceWith($('<span>').text(txt).contents());
                });

                var regex = new RegExp(escapeRegExp(query), 'gi');
                var $elements = $body.find('*:not(script):not(style)');
                var $firstFound = null;

                $elements.each(function () {
                    var $el = $(this);
                    if ($el.children().length === 0) {
                        var text = $el.text();
                        if (regex.test(text)) {
                            var newHtml = text.replace(regex, function (match) {
                                return '<span class="highlight-search">' + match + '</span>';
                            });
                            $el.html(newHtml);
                            if (!$firstFound) { $firstFound = $el; }
                        }
                    }
                });

                if ($firstFound && $firstFound.length) {
                    var targetTop = Math.max(0, $firstFound.offset().top - ($window.height() / 2) + ($firstFound.outerHeight() / 2));
                    $('html, body').scrollTop(targetTop);
                }
            });

            // Shortcut: '/' focuses search input (like many websites)
            $document.on('keydown', function (e) {
                if (e.key === '/') {
                    var $active = $(':focus');
                    var tag = $active && $active.length ? ($active.prop('tagName') || '').toLowerCase() : '';
                    if (tag !== 'input' && tag !== 'textarea') {
                        e.preventDefault();
                        $searchInput.focus();
                    }
                }
            });
        }

        // Back to Top behavior
        if ($backToTopBtn.length) {
            $backToTopBtn.hide().attr('aria-hidden', 'true');
            $window.on('scroll.backToTop', function () {
                if ($window.scrollTop() > 200) {
                    $backToTopBtn.fadeIn(200).attr('aria-hidden', 'false');
                } else {
                    $backToTopBtn.fadeOut(200).attr('aria-hidden', 'true');
                }
            });

            $backToTopBtn.on('click', function (e) {
                e.preventDefault();
                $('html, body').scrollTop(0);
                $(this).blur();
            });
        }

    });
})(jQuery);
