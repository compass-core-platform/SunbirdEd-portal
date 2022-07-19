import { jest } from '@jest/globals';
import $ from 'jquery';

Object.defineProperty(window, 'CSS', { value: null });
declare var jquery:any;

Object.defineProperty(window, 'EkTelemetry', { value: {} });

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
});

Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance'],
    };
  },
});

/**
 * ISSUE: https://github.com/angular/material2/issues/7101
 * Workaround for JSDOM missing transform property
 */
Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});

HTMLCanvasElement.prototype.getContext = <typeof HTMLCanvasElement.prototype.getContext>jest.fn();
