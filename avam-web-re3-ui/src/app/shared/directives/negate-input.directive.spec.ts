import { NegateInputDirective } from './negate-input.directive';
import { ElementRef } from '@angular/core';

describe('NegateInputDirective', () => {
  it('should create an instance', () => {
    const directive = new NegateInputDirective(new ElementRef(null));
    expect(directive).toBeTruthy();
  });
});
