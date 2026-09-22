"use client";

import { Extension } from "@tiptap/core";

export type TextOrientationType =
  | "horizontal"
  | "vertical-rl"
  | "vertical-lr"
  | "rotate-90"
  | "rotate-270"
  | "diagonal-neg45";

export interface TextOrientationOptions {
  types: string[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textOrientation: {
      setTextOrientation: (orientation: TextOrientationType) => ReturnType;
      unsetTextOrientation: () => ReturnType;
    };
  }
}

export const TextOrientationExtension = Extension.create<TextOrientationOptions>({
  name: "textOrientation",

  addOptions() {
    return {
      types: ["heading", "paragraph"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textOrientation: {
            default: "horizontal",
            parseHTML: (element) => {
              const el = element as HTMLElement;
              const attr = el.getAttribute("data-text-orientation");
              if (attr) return attr;

              const wm = el.style.writingMode;
              if (wm === "vertical-rl") return "vertical-rl";
              if (wm === "vertical-lr") return "vertical-lr";

              const transform = el.style.transform;
              if (transform.includes("rotate(-45deg)")) return "diagonal-neg45";
              if (transform.includes("rotate(90deg)")) return "rotate-90";
              if (transform.includes("rotate(270deg)")) return "rotate-270";

              return "horizontal";
            },
            renderHTML: (attributes) => {
              const orientation = attributes.textOrientation as TextOrientationType | undefined;
              if (!orientation || orientation === "horizontal") {
                return {};
              }

              const styleParts: string[] = [];
              if (orientation === "vertical-rl") {
                styleParts.push("writing-mode: vertical-rl");
                styleParts.push("text-orientation: mixed");
              } else if (orientation === "vertical-lr") {
                styleParts.push("writing-mode: vertical-lr");
                styleParts.push("transform: rotate(180deg)");
              } else if (orientation === "diagonal-neg45") {
                styleParts.push("transform: rotate(-45deg)");
                styleParts.push("display: inline-block");
                styleParts.push("transform-origin: center");
              } else if (orientation === "rotate-90") {
                styleParts.push("transform: rotate(90deg)");
                styleParts.push("display: inline-block");
                styleParts.push("transform-origin: center");
              } else if (orientation === "rotate-270") {
                styleParts.push("transform: rotate(270deg)");
                styleParts.push("display: inline-block");
                styleParts.push("transform-origin: center");
              }

              return {
                "data-text-orientation": orientation,
                style: styleParts.join("; "),
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextOrientation:
        (orientation: TextOrientationType) =>
        ({ commands }) => {
          return this.options.types.every((type) =>
            commands.updateAttributes(type, { textOrientation: orientation })
          );
        },
      unsetTextOrientation:
        () =>
        ({ commands }) => {
          return this.options.types.every((type) =>
            commands.updateAttributes(type, { textOrientation: "horizontal" })
          );
        },
    };
  },
});
