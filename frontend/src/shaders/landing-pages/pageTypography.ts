export type LandingPageCustomization = {
  typography?: any;
  color?: string;
  [key: string]: any;
};

export type PageTypographyProps = {
  typography?: any;
};

export function splitTypographyProps<T extends Record<string, any>>(props: T): [any, Omit<T, 'typography'>] {
  const { typography, ...rest } = props;
  return [typography, rest];
}

export function usePageTypography(recipe: any, type: any) {
  return undefined;
}

export function applyPageCustomization(
  frame: HTMLIFrameElement | null,
  customization?: LandingPageCustomization
) {
  if (!frame || !customization) return;
  // Apply any typography or color variables to frame document head if provided
}

export function postPageCustomization(
  frame: HTMLIFrameElement | null,
  customization?: LandingPageCustomization
) {
  if (!frame || !customization) return;
  // Post customization messages to frame if needed
}
