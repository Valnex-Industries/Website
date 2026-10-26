/**
 * Timings shared by the header and the two menus it opens.
 *
 * The header's background and the panel below or beside it are separate
 * elements, so each one used to run its own clock: the bar faded on a 500ms
 * CSS transition while the mega menu took 300ms in and 200ms out, and the
 * drawer slid on a different curve from the glass it was meant to replace.
 * The seams showed as a grey band over the white drawer and a white bar left
 * behind after the menu closed. Both sides now read their timing from here.
 */

/** Same curve the preloader uses, so the site has one "panel" motion. */
export const PANEL_EASE = [0.22, 1, 0.36, 1] as const;

/** The mobile/tablet drawer's slide, and the header glass that gives way to it. */
export const DRAWER_TRANSITION = { duration: 0.5, ease: PANEL_EASE };

/** The desktop mega menu, and the header turning white to meet it. */
export const MENU_IN = { duration: 0.3, ease: "easeOut" } as const;
export const MENU_OUT = { duration: 0.2, ease: "easeIn" } as const;
