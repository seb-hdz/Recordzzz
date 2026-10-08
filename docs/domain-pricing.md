# Precios: artículo e importación

Un **artículo** es un SKU de catálogo. Una **importación** (wave) es un lote que agrupa instancias de uno o más SKUs.

## Quién es dueño de cada monto

| Monto | Dueño | Cuándo se guarda |
| --- | --- | --- |
| Precio de compra | Artículo | Al finalizar el wizard de artículos, haya o no importaciones |
| Impuesto (tasa o monto) | Artículo | Junto con el artículo, si el usuario lo agregó |
| Costo de envío del lote | Importación | Al finalizar el wizard de importación, si el usuario lo agregó |

Un artículo puede existir sin ninguna importación. Una importación puede guardarse sin costo de envío.

## Relación

- Varias importaciones pueden incluir el mismo SKU.
- En una misma importación el SKU aparece **una vez**, con una **cantidad** de instancias.
- El wizard de artículos no vincula el SKU a una importación y no guarda envío.
- El vínculo se crea solo en el wizard de importación, al elegir artículos y cantidades.

## Impuestos del artículo

- **Tasa:** porcentaje aplicado sobre el precio. Se guarda en puntos base (`3250` = 32.50%) y el monto se calcula a partir del precio. `price_includes_taxes` queda en verdadero.
- **Monto:** valor fijo no incluido en el precio. Se guarda en centavos. `price_includes_taxes` queda en falso.
- Sin impuestos: solo el precio. `price_includes_taxes` queda en falso.

## Envío de la importación

El envío es un monto total opcional del lote, en una moneda.

La parte que corresponde a cada línea no se guarda. Se calcula con el registro actual:

```
parte = shipping_total / suma(cantidades) * cantidad_de_la_linea
```

Si después cambia el envío o las cantidades, el cálculo usa esos datos nuevos. No hay un costo de envío histórico en el artículo.

El total mostrado al registrar la importación suma `precio × cantidad` de las líneas que comparten la moneda más frecuente. Cada fila sigue mostrando el precio de su artículo. El envío del lote, si existe, se muestra aparte.

## Fuera de este modelo

El envío por peso y el atajo de “elegir una importación” dentro del wizard de artículos no forman parte del registro. El peso no se persiste.
