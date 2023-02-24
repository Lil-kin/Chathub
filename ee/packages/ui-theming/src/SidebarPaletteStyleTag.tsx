import type { ReactElement } from 'react';
import { memo } from 'react';
import { createPortal } from 'react-dom';

import { sidebarPaletteDark } from './sidebarPaletteDark';
import { defaultSidebarPalette } from './sidebarPalette';
import { darkPalette } from './paletteDark';
import { filterOnlyChangedColors } from './helpers/filterOnlyChangedColors';
import { convertToCss } from './helpers/convertToCss';
import { useThemeMode } from './hooks/useThemeMode';
import { createStyleContainer } from './helpers/createStyleContainer';

export const SidebarPaletteStyleTag = memo((): ReactElement | null => {
	const [, , theme] = useThemeMode();

	const palette = convertToCss(
		theme === 'dark' ? filterOnlyChangedColors(darkPalette, sidebarPaletteDark) : { ...darkPalette, ...defaultSidebarPalette },
		'.rcx-sidebar--main',
	);

	return createPortal(palette, createStyleContainer('sidebar-palette'));
});
