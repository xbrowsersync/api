var xBrowserSync = xBrowserSync || {};
xBrowserSync.API = xBrowserSync.API || {};
xBrowserSync.API.Site = xBrowserSync.API.Site || {};

xBrowserSync.API.Site.Init = function() {
    'use strict';
    
    var serviceStatuses = {
        online: 1,
        offline: 2,
        noNewSyncs: 3
    };

    $('.scroll').bind('click', function(t) {
        var l = $(this);

        if ($('.navbar-collapse').hasClass('in')) {
            $('.navbar-toggle').click();
        }

        $('html, body').stop().animate(
            {
                scrollTop: $(l.attr('href')).offset().top - 70
            }, 
            1250, 
            'easeInOutExpo'), 
            t.preventDefault();
    });

    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 71
    });

    $(function() {
        $.get('/info', function(response) {
            $('#version').text(response.version);
            
            switch (response.status) {
                case 1:
                    $('#currentstatus').text('Online').addClass('success');
                    break;
                case 3:
                    $('#currentstatus').text('Not accepting new syncs').addClass('warning');
                    break;
                default:
                case 2:
                    $('#currentstatus').text('Offline').addClass('danger');
                    break;
            }
        })
        .fail(function() {
            $('#status').text('Offline').addClass('danger');
        });
    });
}();