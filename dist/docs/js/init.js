var xBrowserSync = xBrowserSync || {};
xBrowserSync.API = xBrowserSync.API || {};
xBrowserSync.API.Site = xBrowserSync.API.Site || {};

xBrowserSync.API.Site.Init = function() {
    'use strict';
    
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
        console.log('test');
        $.ajax({
            method: 'GET',
            url: '/info',
            timeout: 5000
        })
            .done(function(response) {
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
                $('#currentstatus').text('Offline').addClass('danger');
            });
    });
}();