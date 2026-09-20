"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DateFilter = "cualquiera" | "hoy" | "finde" | "mes";
export type PriceFilter = "cualquiera" | "gratis" | "pago";
export type CityFilter = string;

interface FiltersBarProps {
  date: DateFilter;
  onDateChange: (value: DateFilter) => void;
  price: PriceFilter;
  onPriceChange: (value: PriceFilter) => void;
  city: CityFilter;
  onCityChange: (value: CityFilter) => void;
  cities: string[];
}

function FiltersBar({ date, onDateChange, price, onPriceChange, city, onCityChange, cities }: FiltersBarProps) {
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

      {cities.length > 0 && (
        <Select value={city} onValueChange={onCityChange}>
          <SelectTrigger className="w-auto min-w-36">
            <SelectValue placeholder="Ciudad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las ciudades</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export { FiltersBar };
