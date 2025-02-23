import {
    ICellData,
    ICommandService,
    IRange,
    IStyleData,
    IUniverInstanceService,
    IWorkbookConfig,
    LocaleType,
    Nullable,
    RANGE_TYPE,
    Rectangle,
    RedoCommand,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { DeleteRangeMutation } from '../../mutations/delete-range.mutation';
import { InsertRangeMutation } from '../../mutations/insert-range.mutation';
import { InsertColMutation, InsertRowMutation } from '../../mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../../mutations/remove-row-col.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import { DeleteRangeMoveLeftCommand } from '../delete-range-move-left.command';
import { DeleteRangeMoveUpCommand } from '../delete-range-move-up.command';
import { createCommandTestBed } from './create-command-test-bed';

const mergeData = [
    {
        startRow: 0,
        endRow: 1,
        startColumn: 2,
        endColumn: 2,
    },
    {
        startRow: 1,
        endRow: 2,
        startColumn: 3,
        endColumn: 3,
    },
    {
        startRow: 1,
        endRow: 1,
        startColumn: 6,
        endColumn: 7,
    },
    {
        startRow: 1,
        endRow: 1,
        startColumn: 9,
        endColumn: 11,
    },
    {
        startRow: 2,
        endRow: 2,
        startColumn: 5,
        endColumn: 6,
    },
    {
        startRow: 2,
        endRow: 2,
        startColumn: 9,
        endColumn: 10,
    },
    {
        startRow: 4,
        endRow: 6,
        startColumn: 2,
        endColumn: 2,
    },
    {
        startRow: 5,
        endRow: 6,
        startColumn: 3,
        endColumn: 3,
    },
];
const WORKBOOK_DATA_DEMO: IWorkbookConfig = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                '0': {
                    '0': {
                        v: 'A1',
                    },
                    '1': {
                        v: 'B1',
                    },
                    '2': {
                        v: 'C1',
                    },
                },
                '1': {
                    '0': {
                        v: 'A2',
                    },
                    '1': {
                        v: 'B2',
                    },
                    '3': {
                        v: 'D2',
                    },
                    '6': {
                        v: 'G2',
                    },
                    '9': {
                        v: 'J2',
                    },
                },
                '2': {
                    '5': {
                        v: 'F3',
                    },
                    '9': {
                        v: 'J3',
                    },
                },
                '4': {
                    '2': {
                        v: 'C5',
                    },
                },
                '5': {
                    '3': {
                        v: 'D6',
                    },
                },
            },
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
    styles: {},
    timeZone: '',
};

describe('Test delete range commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionManager: SelectionManagerService;
    let getValueByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<ICellData>;
    let getStyleByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<IStyleData>;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;
    let getMergedCells: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => IRange[] | undefined;

    beforeEach(() => {
        const testBed = createCommandTestBed(WORKBOOK_DATA_DEMO);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(DeleteRangeMoveUpCommand);
        commandService.registerCommand(DeleteRangeMoveLeftCommand);
        commandService.registerCommand(InsertRangeMutation);
        commandService.registerCommand(DeleteRangeMutation);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(InsertColMutation);
        commandService.registerCommand(RemoveColMutation);
        commandService.registerCommand(InsertRowMutation);
        commandService.registerCommand(RemoveRowMutation);

        selectionManager = get(SelectionManagerService);
        selectionManager.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });

        getValueByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<ICellData> =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValue();

        getStyleByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<IStyleData> => {
            const value = getValueByPosition(startRow, startColumn, endRow, endColumn);
            const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
            if (value && styles) {
                return styles.getStyleByCell(value);
            }
        };

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();

        getMergedCells = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): IRange[] | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getMergeData()
                .filter((rect) => Rectangle.intersects({ startRow, startColumn, endRow, endColumn }, rect));
    });

    afterEach(() => {
        univer.dispose();
    });
    describe('Delete range move left', () => {
        describe('correct situations', () => {
            it('will insert range when there is a selected range, no merged cells', async () => {
                selectionManager.replace([
                    {
                        range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);
                expect(await commandService.executeCommand(DeleteRangeMoveLeftCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual({
                    v: 'B1',
                });

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual({
                    v: 'A1',
                });
                expect(getValueByPosition(0, 1, 0, 1)).toStrictEqual({
                    v: 'B1',
                });

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual({
                    v: 'B1',
                });

                // reset data for next test
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                selectionManager.clear();
                const result = await commandService.executeCommand(DeleteRangeMoveLeftCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
    describe('Delete range move up', () => {
        describe('correct situations', () => {
            it('will insert range when there is a selected range, no merged cells', async () => {
                selectionManager.replace([
                    {
                        range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                expect(await commandService.executeCommand(DeleteRangeMoveUpCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual({
                    v: 'A2',
                });

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual({
                    v: 'A1',
                });
                expect(getValueByPosition(1, 0, 1, 0)).toStrictEqual({
                    v: 'A2',
                });

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual({
                    v: 'A2',
                });

                // reset data for next test
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                selectionManager.clear();
                const result = await commandService.executeCommand(DeleteRangeMoveUpCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
});
