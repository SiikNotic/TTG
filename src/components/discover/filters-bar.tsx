"use client";

import { CITIES } from "@/data/events";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DateFilter = "cualquiera" | "hoy" | "finde" | "mes";
export type PriceFilter = "cualquiera" | "gratis" | "pago";
export type CityFilter = "todas" | (typeof CITIES)[number];

interface FiltersBarProps {
  date: DateFilter;
  onDateChange: (value: DateFilter) => void;
  price: PriceFilter;
  onPriceChange: (value: PriceFilter) => void;
  city: CityFilter;
  onCityChange: (value: CityFilter) => void;
}

function FiltersBar({ date, onDateChange, price, onPriceChange, city, onCityChange }: FiltersBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select value={date} onValueChange={(v) => onDateChange(v as DateFilter)}>
        <SelectTrigger className="w-auto min-w-36">
          <SelectValue placeholder="Fecha" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cualquiera">Cualquier fecha</SelectItem>
          <SelectItem value="hoy">Hoy</SelectItem>
          <SelectItem value="finde">Este fin de semana</SelectItem>
          <SelectItem value="mes">Este mes</SelectItem>
        </SelectContent>
      </Select>

      <Select value={price} onValueChange={(v) => onPriceChange(v as PriceFilter)}>
        <SelectTrigger className="w-auto min-w-32">
          <SelectValue placeholder="Precio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cualquiera">Cualquier precio</SelectItem>
          <SelectItem value="gratis">Gratis</SelectItem>
          <SelectItem value="pago">De pago</SelectItem>
        </SelectContent>
      </Select>

      <Select value={city} onValueChange={(v) => onCityChange(v as CityFilter)}>
        <SelectTrigger className="w-auto min-w-36">
          <SelectValue placeholder="Ciudad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas las ciudades</SelectItem>
          {CITIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { FiltersBar };
