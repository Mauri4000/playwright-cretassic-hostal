/**
 * DateUtils — date helpers for reservations & calendar navigation.
 * All methods return YYYY-MM-DD strings (ISO format used by Supabase).
 */
export class DateUtils {
  static today(): string {
    return new Date().toISOString().split('T')[0];
  }

  static addDays(date: string, days: number): string {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  static tomorrow(): string {
    return DateUtils.addDays(DateUtils.today(), 1);
  }

  static daysFromNow(n: number): string {
    return DateUtils.addDays(DateUtils.today(), n);
  }

  /** Format YYYY-MM-DD → DD/MM/YYYY for UI display */
  static toDisplay(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  /** Bolivian month name */
  static monthName(iso: string): string {
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    return months[Number(iso.split('-')[1]) - 1];
  }
}
