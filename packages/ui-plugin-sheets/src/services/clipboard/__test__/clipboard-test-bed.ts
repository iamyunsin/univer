import { SelectionManagerService } from '@univerjs/base-sheets';
import {
    BrowserClipboardService,
    DesktopMessageService,
    IClipboardInterfaceService,
    IMessageService,
} from '@univerjs/base-ui';
import {
    ILogService,
    IUniverInstanceService,
    IWorkbookConfig,
    LocaleType,
    Plugin,
    PluginType,
    Univer,
} from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { SheetClipboardController } from '../../../controller/clipboard/clipboard.controller';
import { ISheetClipboardService, SheetClipboardService } from '../clipboard.service';

const cellData = {
    '0': {
        '7': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '8': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '10': {
            v: '456',
            m: '456',
            s: '3UpAbI',
        },
        '11': {
            s: '3UpAbI',
        },
    },
    '1': {
        '5': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '6': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '7': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '8': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
    },
    '2': {
        '8': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
    },
    '3': {
        '5': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '6': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '7': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '8': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '10': {
            s: '3UpAbI',
            v: '456',
            m: '456',
        },
        '11': {
            s: '3UpAbI',
        },
        '12': {
            s: '3UpAbI',
        },
    },
    '5': {
        '5': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '6': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '7': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '8': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
    },
    '6': {
        '7': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '8': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '10': {
            v: '456',
            m: '456',
            s: 'hw-erj',
        },
        '11': {
            s: 'hw-erj',
        },
    },
    '7': {
        '7': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '8': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
    },
    '8': {
        '5': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '6': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '7': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '8': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '11': {
            v: '456',
            m: '456',
            s: '_aRLOe',
        },
        '12': {
            s: '_aRLOe',
        },
    },
    '9': {
        '7': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '8': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '11': {
            s: '_aRLOe',
        },
        '12': {
            s: '_aRLOe',
        },
    },
    '10': {
        '5': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '6': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '7': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '8': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
    },
    '11': {
        '8': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
        '10': {
            v: '456',
            m: '456',
            s: 'Mtn4vb',
        },
        '11': {
            s: 'Mtn4vb',
        },
        '12': {
            s: 'Mtn4vb',
        },
    },
    '12': {
        '8': {
            v: ' ',
            m: ' ',
            s: 'u5otPe',
        },
    },
    '13': {
        '11': {
            v: '456',
            m: '456',
            s: '3UpAbI',
        },
        '12': {
            s: '3UpAbI',
        },
    },
    '14': {
        '11': {
            s: '3UpAbI',
        },
        '12': {
            s: '3UpAbI',
        },
    },
    '16': {
        '10': {
            v: '456',
            m: '456',
            s: '3UpAbI',
        },
        '11': {
            s: '3UpAbI',
        },
    },
    '17': {
        '11': {
            v: '456',
            m: '456',
            s: '3UpAbI',
        },
        '12': {
            s: '3UpAbI',
        },
    },
    '18': {
        '11': {
            s: '3UpAbI',
        },
        '12': {
            s: '3UpAbI',
        },
    },
    '21': {
        '10': {
            v: '456',
            m: '456',
            s: '3UpAbI',
        },
        '11': {
            s: '3UpAbI',
        },
    },
    '22': {
        '10': {
            s: '3UpAbI',
        },
        '11': {
            s: '3UpAbI',
        },
    },
    '23': {
        '11': {
            v: '456',
            m: '456',
            s: '3UpAbI',
        },
        '12': {
            s: '3UpAbI',
        },
    },
};

const styles = {
    u5otPe: {
        bd: {},
    },
    '3UpAbI': {
        bg: {
            rgb: '#ccc',
        },
    },
    'hw-erj': {
        bg: {
            rgb: '#ccc',
        },
        ht: 2,
    },
    _aRLOe: {
        bg: {
            rgb: '#ccc',
        },
        ht: 2,
        vt: 2,
    },
    Mtn4vb: {
        bg: {
            rgb: '#ccc',
        },
        ht: 3,
    },
};

const mergeData = [
    {
        startRow: 16,
        endRow: 16,
        startColumn: 10,
        endColumn: 11,
    },
    {
        startRow: 21,
        endRow: 22,
        startColumn: 10,
        endColumn: 11,
    },
    // check
    {
        startRow: 0,
        startColumn: 5,
        endRow: 0,
        endColumn: 6,
    },
    // check
    {
        startRow: 2,
        startColumn: 5,
        endRow: 2,
        endColumn: 7,
    },
    // check
    {
        startRow: 4,
        startColumn: 5,
        endRow: 4,
        endColumn: 8,
    },
    // check
    {
        startRow: 6,
        startColumn: 5,
        endRow: 7,
        endColumn: 6,
    },
    // check
    {
        startRow: 9,
        startColumn: 5,
        endRow: 9,
        endColumn: 6,
    },
    // check
    {
        startRow: 11,
        startColumn: 5,
        endRow: 12,
        endColumn: 6,
    },
    // check
    {
        startRow: 11,
        startColumn: 7,
        endRow: 12,
        endColumn: 7,
    },
    // check
    {
        startRow: 0,
        startColumn: 10,
        endRow: 0,
        endColumn: 11,
    },
    // check
    {
        startRow: 3,
        startColumn: 10,
        endRow: 3,
        endColumn: 12,
    },
    // check
    {
        startRow: 6,
        startColumn: 10,
        endRow: 6,
        endColumn: 11,
    },
    // check
    {
        startRow: 8,
        startColumn: 11,
        endRow: 9,
        endColumn: 12,
    },
    // check
    {
        startRow: 11,
        startColumn: 10,
        endRow: 11,
        endColumn: 12,
    },
    // check
    {
        startRow: 13,
        startColumn: 11,
        endRow: 14,
        endColumn: 12,
    },
    {
        startRow: 17,
        startColumn: 11,
        endRow: 18,
        endColumn: 12,
    },
    {
        startRow: 23,
        startColumn: 11,
        endRow: 23,
        endColumn: 12,
    },
];

const TEST_WORKBOOK_DATA_DEMO: IWorkbookConfig = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData,
            mergeData,
        },
    },
    createdTime: '',
    creator: '',
    extensions: [],
    lastModifiedBy: '',
    locale: LocaleType.EN,
    modifiedTime: '',
    name: '',
    sheetOrder: [],
    styles,
    timeZone: '',
};

export function clipboardTestBed(workbookConfig?: IWorkbookConfig, dependencies?: Dependency[]) {
    const univer = new Univer();

    let get: Injector['get'] | undefined;

    /**
     * This plugin hooks into Sheet's DI system to expose API to test scripts
     */
    class TestSpyPlugin extends Plugin {
        static override type = PluginType.Sheet;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super('test-plugin');

            this._injector = _injector;
            get = this._injector.get.bind(this._injector);
        }

        override onStarting(injector: Injector): void {
            injector.add([SelectionManagerService]);
            injector.add([IClipboardInterfaceService, { useClass: BrowserClipboardService, lazy: true }]);
            injector.add([ISheetClipboardService, { useClass: SheetClipboardService }]);
            injector.add([IMessageService, { useClass: DesktopMessageService, lazy: true }]);

            // Because SheetClipboardController is initialized in the rendered life cycle, here we need to initialize it manually
            const sheetClipboardController = injector.createInstance(SheetClipboardController);
            injector.add([SheetClipboardController, { useValue: sheetClipboardController }]);

            dependencies?.forEach((d) => injector.add(d));
        }

        override onDestroy(): void {
            get = undefined;
        }
    }

    univer.registerPlugin(TestSpyPlugin);
    const sheet = univer.createUniverSheet(workbookConfig || TEST_WORKBOOK_DATA_DEMO);

    if (get === undefined) {
        throw new Error('[TestPlugin]: not hooked on!');
    }

    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUniverInstance('test');

    const logService = get(ILogService);
    logService.toggleLogEnabled(false); // change this to `true` to debug tests via logs

    return {
        univer,
        get,
        sheet,
    };
}
