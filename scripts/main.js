(function ($) {

    "use strict";

    let currentLang = "it";

    let audio = null;
    let isPlaying = false;

    $('.play-audio').on('click', function () {

        const icon = $(this).find('i');

        const audioSrc = currentLang === 'it' ? 'audio/presentation.mp3' : 'audio/presentation-en.mp3';

        if (isPlaying && audio) {
            audio.pause();
            audio.currentTime = 0;
            isPlaying = false;
            icon.removeClass('bi-stop-circle').addClass('bi-volume-up');
            return;
        }

        audio = new Audio(audioSrc);
        isPlaying = true;

        icon.removeClass('bi-volume-up').addClass('bi-stop-circle');
        audio.play();

        audio.addEventListener('ended', function () {
            isPlaying = false;
            icon.removeClass('bi-stop-circle').addClass('bi-volume-up');
        });
    });

    function escapeRegExp(str) {
        return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    $(function () {

        var $window = $(window);
        var $document = $(document);
        var $body = $("body");

        var $searchForm = $("#searchForm");
        var $searchInput = $("#searchInput");
        var $backToTopBtn = $("#backToTopBtn");

        if ($searchForm.length && $searchInput.length) {

            $searchForm.on("submit", function (e) {

                e.preventDefault();

                var query = $.trim($searchInput.val() || "");
                if (!query) {
                    return;
                }

                $body.find(".highlight-search").each(function () {
                    var $span = $(this);
                    var txt = $span.text();
                    $span.replaceWith($("<span>").text(txt).contents());
                });

                var regex = new RegExp(escapeRegExp(query), "gi");
                var $elements = $body.find("*:not(script):not(style)");
                var $firstFound = null;

                $elements.each(function () {

                    var $el = $(this);

                    if ($el.children().length === 0) {

                        var text = $el.text();

                        if (regex.test(text)) {

                            var newHtml = text.replace(regex, function (match) {
                                return '<span class="highlight-search">' + match + "</span>";
                            });

                            $el.html(newHtml);

                            if (!$firstFound) {
                                $firstFound = $el;
                            }
                        }
                    }
                });

                if ($firstFound && $firstFound.length) {

                    var targetTop = Math.max(
                        0,
                        $firstFound.offset().top -
                        $window.height() / 2 +
                        $firstFound.outerHeight() / 2,
                    );

                    $("html, body").scrollTop(targetTop);
                }
            });

            $document.on("keydown", function (e) {

                if (e.key === "/") {

                    var $active = $(":focus");
                    var tag =
                        $active && $active.length
                            ? ($active.prop("tagName") || "").toLowerCase()
                            : "";

                    if (tag !== "input" && tag !== "textarea") {
                        e.preventDefault();
                        $searchInput.focus();
                    }
                }
            });
        }

        // Back to Top

        if ($backToTopBtn.length) {

            $backToTopBtn.hide().attr("aria-hidden", "true");

            $window.on("scroll.backToTop", function () {

                if ($window.scrollTop() > 200) {
                    $backToTopBtn.fadeIn(200).attr("aria-hidden", "false");
                } else {
                    $backToTopBtn.fadeOut(200).attr("aria-hidden", "true");
                }
            });

            $backToTopBtn.on("click", function (e) {

                e.preventDefault();

                $("html, body").scrollTop(0);
                $(this).blur();
            });
        }
    });

    function loadData() {

        const jsonLabels = currentLang === "it" ? "labels/labels.json" : "labels/labels-en.json";
        const jsonData = currentLang === "it" ? "data/data.json" : "data/data-en.json";

        let labels = {};

        $.getJSON(jsonLabels, function (data) {
            labels = data;
        }).fail(function () {
            console.error("Errore caricamento data.json");
        });

        $.getJSON(jsonData, function (data) {

            $('title').text(data.title);

            $('#searchInput').attr('placeholder', data.searchPlaceholder);

            const $list = $("#navbarList");
            $list.empty();

            data.menu
                .filter((item) => item.visible)
                .sort((a, b) => a.order - b.order)
                .forEach((item) => {
                    const $li = $("<li>", { class: "nav-item" });
                    const $a = $("<a>", {
                        class: "nav-link",
                        href: item.href,
                        text: item.label,
                    });

                    $li.append($a);
                    $list.append($li);
                });

            // Popola la card del profilo

            $('#profile-img').attr('src', data.profile.profileImg).attr('alt', data.profile.name);
            $('#profile-cover').css('background-image', 'url(' + data.profile.coverImg + ')');
            $('#profile-name').text(data.profile.name);
            $('#profile-role').text(data.profile.role);
            $('#profile-location').text(data.profile.location);
            $('#profile-experience').text(data.profile.experience);
            $('#profile-cv').attr('href', data.profile.cv);
            $('#profile-information-title').text(labels.information);
            $('#profile-information').text(data.profile.information);
            $('#presentation').text(" " + labels.presentation);
            $('#download-cv').text(" " + labels.downloadCV);

            const $socialContainer = $('#profile-social');

            $socialContainer.empty();

            data.profile.social.forEach(function (social, index) {

                const $icon = $('<i>').addClass('bi ' + social.icon);

                const $link = $('<a>')
                    .attr('href', social.href)
                    .attr('target', '_blank')
                    .addClass('text-decoration-none')
                    .attr('id', social.id)
                    .text(" " + social.text);

                $socialContainer.append($icon, $link);

                if (index < data.profile.social.length - 1) {
                    $socialContainer.append('&nbsp;·&nbsp;');
                }
            });

            // Popola la card delle esperienze

            var $expContainer = $('#experience-list');

            $expContainer.empty();

            data.experience.forEach(function (exp) {

                $('#experience-title').text(labels.experience);

                var $item = $('<div>', { class: 'experience-item mb-3' });

                $item.append('<h6>' + exp.role + '</h6>');
                $item.append(
                    '<div class="company">' +
                    exp.company + ' · ' + exp.period +
                    '</div>'
                );

                exp.activities.forEach(function (act) {

                    $item.append(
                        '<p class="small mt-2">' + act.description + '</p>'
                    );

                    if (act.details && act.details.length) {

                        var $ul = $('<ul>');

                        act.details.forEach(function (detail) {
                            $ul.append('<li>' + detail + '</li>');
                        });

                        $item.append(
                            $('<div>', { class: 'experience-details' })
                                .append(labels.skillsDetails)
                                .append($ul)
                        );
                    }
                });

                $expContainer.append($item);
            });

            // Popola la sezione Competenze Professionali

            $('#professionalSkills-title').text(labels.professionalSkills);

            var $skillsContainer = $('#competenze .skill-badges');

            $skillsContainer.empty();

            $.each(data.skills, function (category, skillsArray) {

                skillsArray.forEach(function (skill) {

                    $skillsContainer.append(
                        $('<span>', {
                            class: 'badge badge-skill',
                            text: skill
                        })
                    );
                });
            });

            // Popola la sezione soft Skills

            $('#soft-skills-title').text(labels.softSkills);

            var $softSkillsContainer = $('#soft-skills .skill-badges');

            $softSkillsContainer.empty();

            data.softSkills.forEach(function (skill) {

                $softSkillsContainer.append(
                    $('<span>', {
                        class: 'badge badge-skill',
                        text: skill
                    })
                );
            });

            // Popola la sezione Formazione

            $('#education-title').text(labels.education);

            var $eduContainer = $('#formazione .education-details');

            $eduContainer.empty();

            var $ul = $('<ul>');

            data.education.forEach(function (item) {

                var $li = $('<li>').text(item.title + ' – ' + item.institution + ' (' + item.year + ')');

                if (item.description) {
                    $li.append('<p>' + item.description + '</p>');
                }

                $ul.append($li);
            });

            $eduContainer.append($ul);

            // Popola la sezione Lingua

            $('#languages-title').text(labels.languages);

            var $langContainer = $('#lingue .language-details');

            $langContainer.empty();

            data.languages.forEach(function (lang) {

                var $item = $('<div>', { class: 'language-item mb-3' });

                if (lang.level) {

                    $item.append('<p class="mb-1"><strong>' + lang.name + '</strong> – ' + lang.level + '</p>');

                } else if (lang.skills) {

                    $item.append('<p class="mb-1"><strong>' + lang.name + '</strong></p>');

                    var $ul = $('<ul>', { class: 'list-unstyled small mb-0' });

                    for (var skill in lang.skills) {
                        $ul.append('<li>' + skill + ': ' + lang.skills[skill] + '</li>');
                    }

                    $item.append($ul);
                }

                $langContainer.append($item);
            });

            // Popola la sezione Footer

            var $footerInfo = $('#footer-info');

            $footerInfo.empty();

            $footerInfo.append('<i class="bi ' + data.footer.info.icon + ' fs-2 text-primary me-2 fixed-icon-size"></i>');
            $footerInfo.append('<div><p class="mb-0 fs-5"><strong>' + data.footer.info.name + '</strong></p><p class="mb-0">' + data.footer.info.description + '</p></div>');

            $('#links-title').text(labels.links);

            var $footerLinks = $('#footer-links ul');

            $footerLinks.empty();

            data.footer.links.forEach(function (link) {
                $footerLinks.append('<li><a href="' + link.href + '" class="text-muted text-decoration-none">' + link.text + '</a></li>');
            });

            $('#social-title').text(labels.social);

            var $footerSocial = $('#footer-social');

            $footerSocial.find('a, i').remove();

            data.footer.social.forEach(function (social) {
                $footerSocial.append('<a href="' + social.href + '" class="text-muted me-2 fs-5"><i class="bi ' + social.icon + '"></i></a>');
            });

            $('#footer-note').html(data.footer.note);

        }).fail(function () {
            console.error("Errore caricamento data.json");
        });
    }

    $('#langIt').on('click', function (e) {
        e.preventDefault();
        currentLang = "it";
        loadData();
    });

    $('#langEn').on('click', function (e) {
        e.preventDefault();
        currentLang = "en";
        loadData();
    });

    loadData();

})(jQuery);