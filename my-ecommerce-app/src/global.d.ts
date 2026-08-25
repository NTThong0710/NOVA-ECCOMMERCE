import * as React from 'react';

declare module 'react-google-recaptcha';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'star-rating': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { 
        rating?: string | number 
      };
    }
  }
}