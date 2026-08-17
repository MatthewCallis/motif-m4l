import "preact";

declare module "preact" {
  namespace JSX {
    interface HTMLAttributes {
      /** React-style alias; Preact types only list `spellcheck`. */
      spellCheck?: boolean;
    }

    interface InputHTMLAttributes<T extends EventTarget = HTMLInputElement> {
      /** React-style alias for input elements. */
      spellCheck?: boolean;
    }
  }
}
