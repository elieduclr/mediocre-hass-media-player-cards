/* eslint-disable @typescript-eslint/no-explicit-any */
import { HomeAssistant as CCHHomeAssistant } from "custom-card-helpers";
import "preact";
import { MediaPlayerEntity } from "@types";

export type HomeAssistant = Omit<CCHHomeAssistant, "states"> & {
  hassUrl: (path: string) => string;
  states: CCHHomeAssistant["states"] & {
    [key: `media_player.${string}`]: MediaPlayerEntity;
  };
};

/**
 * Retourne une URL sécurisée pour éviter le Mixed Content.
 * Si l'URL est HTTP, elle est réécrite pour passer via HA ingress.
 */
export const getSafeHassUrl = (url: string): string => {
  // Si déjà HTTPS → ok
  if (url.startsWith("https://")) return url;

  // Si l'URL est HTTP absolue → on tente de passer via ingress
  if (url.startsWith("http://")) {
    const ingressPath = window.location.pathname
      .split("/")
      .slice(0, 3)
      .join("/"); // /api/hassio_ingress/<token>
    return `${ingressPath}/imageproxy?path=${encodeURIComponent(url)}`;
  }

  // Fallback classique hassUrl
  const hass = (window as any).hass as HomeAssistant | undefined;
  if (hass?.hassUrl) return hass.hassUrl(url);

  return url;
};

interface HaIconAttributes extends preact.JSX.HTMLAttributes<HTMLElement> {
  icon: string;
}

export type HaFormSchema = {
  name: string;
  label?: string;
  selector?: {
    [key: string]: unknown;
  };
}[];

interface HaFormAttributes extends preact.JSX.HTMLAttributes<HTMLElement> {
  hass?: HomeAssistant;
  data?: any;
  schema?: HaFormSchema;
  computeLabel?: (arg0: any) => string;
  disabled?: boolean;
  required?: boolean;
}

interface HaIconPickerAttributes
  extends preact.JSX.HTMLAttributes<HTMLElement> {
  label?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  hass?: HomeAssistant;
  "onvalue-changed"?: (e: CustomEvent) => void;
}

interface HaTextfieldAttributes extends preact.JSX.HTMLAttributes<HTMLElement> {
  label?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  onchange?: (e: Event) => void;
}

interface HaEntityPickerAttributes
  extends preact.JSX.HTMLAttributes<HTMLElement> {
  hass?: HomeAssistant;
  value?: string;
  label?: string;
  includeDomains?: string[];
  disabled?: boolean;
  required?: boolean;
  "allow-custom-entity"?: boolean;
}

interface HaEntitiesPickerAttributes
  extends preact.JSX.HTMLAttributes<HTMLElement> {
  hass?: HomeAssistant;
  value?: string[];
  label?: string;
  includeDomains?: string[];
  disabled?: boolean;
  required?: boolean;
  "allow-custom-entity"?: boolean;
}

declare module "preact" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "ha-icon": HaIconAttributes;
      "ha-card": preact.JSX.HTMLAttributes;
      "ha-slider": preact.JSX.InputHTMLAttributes<HTMLInputElement>;
      "ha-form": HaFormAttributes;
      "ha-icon-picker": HaIconPickerAttributes;
      "ha-textfield": HaTextfieldAttributes;
      "ha-entity-picker": HaEntityPickerAttributes;
      "ha-entities-picker": HaEntitiesPickerAttributes;
    }
  }
}

declare global {
  interface Window {
    customCards: any[];
    hass?: HomeAssistant;
  }
}
