// Nombres de los estados de un pedido en «Mi cuenta». En español son los
// mismos del panel; el panel no se traduce, la cuenta sí.

import { textos } from '@/lib/i18n';
import { NOMBRE_ESTADO_PEDIDO } from '@/lib/panel/estados';

export const ESTADOS_PEDIDO_T = textos(NOMBRE_ESTADO_PEDIDO, {
  en: {
    pagado: 'Paid',
    en_preparacion: 'Being prepared',
    enviado: 'Shipped',
    entregado: 'Delivered',
    cancelado: 'Cancelled',
    reembolsado: 'Refunded',
  },
  fr: {
    pagado: 'Payée',
    en_preparacion: 'En préparation',
    enviado: 'Expédiée',
    entregado: 'Livrée',
    cancelado: 'Annulée',
    reembolsado: 'Remboursée',
  },
  de: {
    pagado: 'Bezahlt',
    en_preparacion: 'In Vorbereitung',
    enviado: 'Versandt',
    entregado: 'Zugestellt',
    cancelado: 'Storniert',
    reembolsado: 'Erstattet',
  },
});
