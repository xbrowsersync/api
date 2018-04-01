import { autobind } from 'core-decorators';
import * as SmoothScroll from 'smooth-scroll';
import 'whatwg-fetch';
import { IGetInfoResponse } from '../infoService';

class Docs {
  @autobind
  public static async onInit() {
    // Add support for promises pre-es6
    require('es6-promise').polyfill();

    // Enable smooth scrolling of page links
    const scroll = new SmoothScroll('a[href*="#"]', {
      offset: 69
    });

    const navbar = document.querySelector('.navbar-collapse');
    const toggle = document.querySelector('.navbar-toggle') as HTMLButtonElement;
    const versionEl = document.querySelector('#version');
    const currentStatusEl = document.querySelector('#currentstatus');

    const toggleMenu = () => {
      if (navbar.classList.contains('collapse')) {
        navbar.classList.remove('collapse');
        toggle.classList.remove('collapsed');
      }
      else {
        navbar.classList.add('collapse');
        toggle.classList.add('collapsed');
      }
    };

    toggle.addEventListener('click', e => {
      toggleMenu();
    });

    document.querySelector('.navbar-right').addEventListener('click', e => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('scroll')) {
        toggleMenu();
      }
    });

    // Display current status and version for this xBrowserSync service
    try {
      const response = await fetch('/info');
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const apiInfo: IGetInfoResponse = await response.json();
      if (apiInfo) {
        versionEl.textContent = apiInfo.version;
      }

      switch (apiInfo.status) {
        case 1:
          currentStatusEl.textContent = 'Online';
          currentStatusEl.className = 'success';
          break;
        case 3:
          currentStatusEl.textContent = 'Not accepting new syncs';
          currentStatusEl.className = 'warning';
          break;
        default:
        case 2:
          currentStatusEl.textContent = 'Offline';
          currentStatusEl.className = 'danger';
          break;
      }
    }
    catch (err) {
      currentStatusEl.textContent = 'Offline';
      currentStatusEl.className = 'danger';
    }
  }
}

document.addEventListener('DOMContentLoaded', Docs.onInit);


/*const info: RequestInfo = {
    cache: 
    url: '/info'
};
fetch()*/


/*var xBrowserSync = xBrowserSync || {};
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
}();*/