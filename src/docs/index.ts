import { autobind } from 'core-decorators';
import * as SmoothScroll from 'smooth-scroll';
import 'whatwg-fetch';
import { IGetInfoResponse } from '../infoService';

// API home page and documentation
class Docs {
  // Initialises the page once DOM is ready
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
      // Toggle navbar collapse and menu button highlight
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

    // Toggle menu bar when menu item clicked
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