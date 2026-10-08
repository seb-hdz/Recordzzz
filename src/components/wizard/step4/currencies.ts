import type { Currency } from "@/domain/types";

import peFlag from "@/assets/icons/flags/pe.svg?raw";
import euFlag from "@/assets/icons/flags/eu.svg?raw";
import usFlag from "@/assets/icons/flags/us.svg?raw";
import ukFlag from "@/assets/icons/flags/uk.svg?raw";
import caFlag from "@/assets/icons/flags/ca.svg?raw";
import auFlag from "@/assets/icons/flags/au.svg?raw";
import jpFlag from "@/assets/icons/flags/jp.svg?raw";

import penIcon from "@/assets/icons/currency/pen.svg?raw";
import eurIcon from "@/assets/icons/currency/eur.svg?raw";
import dollarIcon from "@/assets/icons/currency/dollar.svg?raw";
import gbpIcon from "@/assets/icons/currency/gbp.svg?raw";
import yenIcon from "@/assets/icons/currency/yen.svg?raw";

export interface WizardCurrency {
  id: Currency;
  flag: string;
  icon: string;
  name: string;
  country: string;
}

export const WIZARD_CURRENCIES: WizardCurrency[] = [
  {
    id: "PEN",
    flag: peFlag,
    icon: penIcon,
    name: "Sol",
    country: "Perú",
  },
  {
    id: "EUR",
    flag: euFlag,
    icon: eurIcon,
    name: "Euro",
    country: "Europa",
  },
  {
    id: "USD",
    flag: usFlag,
    icon: dollarIcon,
    name: "Dólar",
    country: "EE.UU.",
  },
  {
    id: "GBP",
    flag: ukFlag,
    icon: gbpIcon,
    name: "Libra",
    country: "UK",
  },
  {
    id: "CAD",
    flag: caFlag,
    icon: dollarIcon,
    name: "Dólar",
    country: "Canadá",
  },
  {
    id: "AUD",
    flag: auFlag,
    icon: dollarIcon,
    name: "Dólar",
    country: "Australia",
  },
  {
    id: "JPY",
    flag: jpFlag,
    icon: yenIcon,
    name: "Yen",
    country: "Japón",
  },
];

export function getWizardCurrency(id: Currency): WizardCurrency {
  return WIZARD_CURRENCIES.find((c) => c.id === id) ?? WIZARD_CURRENCIES[0];
}
