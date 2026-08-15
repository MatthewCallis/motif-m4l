import "preact";

declare module "preact" {
  namespace JSX {
    interface HTMLAttributes {
      /** React-style alias; Preact types only list `spellcheck`. */
      spellCheck?: boolean;
    }
  }
}
