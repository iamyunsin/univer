interface IProps {
    theme: Record<string, string>;
}

const levelMap = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950', '1000'];

function convertToLessVar(input: string): string {
    const dashCase = input.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`).replace(/(\d+)/g, '-$1');

    return `@${dashCase}`;
}

function convertToCSSVar(input: string): string {
    const dashCase = input.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`).replace(/(\d+)/g, '-$1');

    return `--${dashCase}`;
}

export function Palette(props: IProps) {
    const { theme } = props;

    function generateColors(name: string, maxLevel: number) {
        const colors = [];
        for (let i = 0; i < maxLevel; i++) {
            colors.push(`${name}${levelMap[i]}`);
        }

        return colors;
    }

    const palettes = [
        {
            title: 'Brand / 品牌',
            colors: ['primaryColor', 'primaryColorHover'],
        },
        {
            title: 'Fuctional / 功能',
            colors: ['infoColor', 'successColor', 'warningColor', 'errorColor'],
        },
        {
            title: 'Text Color',
            colors: ['textColor', 'textColorSecondary', 'textColorTertiary'],
        },
        {
            title: 'Link',
            colors: ['linkColor'],
        },
        {
            title: 'Background',
            colors: ['bgColor', 'bgColorHover', 'bgColorSecondary'],
        },
        {
            title: 'Font Size',
            colors: ['fontSizeXs', 'fontSizeSm', 'fontSizeBase', 'fontSizeLg', 'fontSizeXl', 'fontSizeXxl'],
        },
        {
            title: 'Margin',
            colors: ['marginXs', 'marginXxs', 'marginSm', 'marginBase', 'marginLg', 'marginXl'],
        },
        {
            title: 'Padding',
            colors: ['paddingXs', 'paddingSm', 'paddingBase', 'paddingLg', 'paddingXl'],
        },
        {
            title: 'Border Color',
            colors: ['borderColor'],
        },
        {
            title: 'Border Radius',
            colors: ['borderRadiusBase', 'borderRadiusLg', 'borderRadiusXl'],
        },
        {
            title: 'Box Shadow',
            colors: ['boxShadowBase', 'boxShadowLg'],
        },
        {
            title: 'Ramu / 瑞木 / Red',
            colors: generateColors('red', 9),
        },
        {
            title: 'Hemerocallis / 萱草 / Orange',
            colors: generateColors('orange', 9),
        },
        {
            title: 'Marigold / 万寿菊 / Gold',
            colors: generateColors('gold', 9),
        },
        {
            title: 'Forsythia Suspensa / 连翘 / Yellow',
            colors: generateColors('yellow', 9),
        },
        {
            title: 'Eustoma Grandiflorum / 洋桔梗 / Verdancy',
            colors: generateColors('verdancy', 9),
        },
        {
            title: 'Asparagus Fern / 文竹 / Green',
            colors: generateColors('green', 9),
        },
        {
            title: '霁 / Jiqing',
            colors: generateColors('jiqing', 9),
        },
        {
            title: 'Cornflower / 矢车菊 / Blue',
            colors: generateColors('blue', 9),
        },
        {
            title: 'Hyacinth / 风信子 / Hyacinth Blue',
            colors: generateColors('hyacinth', 9),
        },
        {
            title: 'Violet / 紫罗兰 / Purple',
            colors: generateColors('purple', 9),
        },
        {
            title: 'Sorrel pulp / 酢浆 / Magenta',
            colors: generateColors('magenta', 9),
        },
        {
            title: '灰 / Grey',
            colors: generateColors('grey', 12),
        },
        {
            title: '黑 / 白 / Black / White',
            colors: ['colorBlack', 'colorWhite'],
        },
    ];

    return (
        <section>
            {palettes.map((palette) => (
                <section key={palette.title}>
                    <h3>{palette.title}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>name</th>
                                <th>value</th>
                                <th>Less variable (deprecated)</th>
                                <th>CSS variable</th>
                            </tr>
                        </thead>

                        <tbody>
                            {palette.colors.map((color) => (
                                <tr key={color}>
                                    <td>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '13px',
                                            }}
                                        >
                                            {theme[color].startsWith('#') && (
                                                <div
                                                    style={{
                                                        display: 'inline-block',
                                                        width: '16px',
                                                        height: '16px',
                                                        backgroundColor: theme[color],
                                                    }}
                                                />
                                            )}
                                            {color}
                                        </div>
                                    </td>
                                    <td>
                                        <pre style={{ fontSize: '13px' }}>{theme[color]}</pre>
                                    </td>
                                    <td>{convertToLessVar(color)}</td>
                                    <td>{convertToCSSVar(color)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            ))}
        </section>
    );
}
