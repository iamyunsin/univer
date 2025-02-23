/* eslint-disable no-magic-numbers */

import {
    Direction,
    ICommandService,
    IUniverInstanceService,
    IWorkbookConfig,
    RANGE_TYPE,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { SetColHiddenMutation, SetColVisibleMutation } from '../../mutations/set-col-visible.mutation';
import { SetRowHiddenMutation, SetRowVisibleMutation } from '../../mutations/set-row-visible.mutation';
import { SetColHiddenCommand, SetSelectedColsVisibleCommand } from '../set-col-visible.command';
import { SetRowHiddenCommand, SetSelectedRowsVisibleCommand } from '../set-row-visible.command';
import {
    ExpandSelectionCommand,
    IExpandSelectionCommandParams,
    IMoveSelectionCommandParams,
    ISelectAllCommandParams,
    MoveSelectionCommand,
    SelectAllCommand,
} from '../set-selections.command';
import {
    createSelectionCommandTestBed,
    SELECTION_WITH_EMPTY_CELLS_DATA,
    SELECTION_WITH_MERGED_CELLS_DATA,
} from './create-selection-command-test-bed';

describe('Test commands used for change selections', () => {
    let univer: Univer | null = null;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionManagerService: SelectionManagerService;

    function select00() {
        selectionManagerService.replace([
            {
                range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                primary: {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 0,
                    endColumn: 0,
                    actualRow: 0,
                    actualColumn: 0,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    }

    function select(
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number,
        actualRow: number,
        actualColumn: number,
        isMerged: boolean,
        isMergedMainCell: boolean
    ) {
        selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });

        selectionManagerService.add([
            {
                range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                primary: {
                    startRow,
                    startColumn,
                    endRow,
                    endColumn,
                    actualRow,
                    actualColumn,
                    isMerged,
                    isMergedMainCell,
                },
                style: null,
            },
        ]);
    }

    function expectSelectionToBe(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        expect(selectionManagerService.getLast()!.range).toEqual({
            startRow,
            startColumn,
            endRow,
            endColumn,
            rangeType: RANGE_TYPE.NORMAL,
        });
    }

    function getRowCount(): number {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getRowCount();
    }

    function getColCount(): number {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getColumnCount();
    }

    function getRowVisible(row: number): boolean {
        const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getRowVisible(row);
    }

    function getColVisible(col: number): boolean {
        const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getColVisible(col);
    }

    function selectRow(rowStart: number, rowEnd: number): void {
        const selectionManagerService = get(SelectionManagerService);
        const endColumn = getColCount() - 1;
        selectionManagerService.add([
            {
                range: { startRow: rowStart, startColumn: 0, endColumn, endRow: rowEnd, rangeType: RANGE_TYPE.ROW },
                primary: {
                    startRow: rowStart,
                    endRow: rowEnd,
                    startColumn: 0,
                    endColumn,
                    actualColumn: 0,
                    actualRow: rowStart,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    }

    function selectColumn(columnStart: number, columnEnd: number): void {
        const selectionManagerService = get(SelectionManagerService);
        const endRow = getRowCount() - 1;
        selectionManagerService.add([
            {
                range: {
                    startRow: 0,
                    startColumn: columnStart,
                    endColumn: columnEnd,
                    endRow,
                    rangeType: RANGE_TYPE.COLUMN,
                },
                primary: {
                    startRow: 0,
                    endRow,
                    startColumn: columnStart,
                    endColumn: columnEnd,
                    actualColumn: columnStart,
                    actualRow: 0,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    }

    function disposeTestBed() {
        univer?.dispose();
        univer = null;
    }

    function prepareTestBed(snapshot?: IWorkbookConfig) {
        const testBed = createSelectionCommandTestBed(snapshot);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        selectionManagerService = get(SelectionManagerService);
        selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });
    }

    afterEach(disposeTestBed);

    describe('Simple movement to next cell', () => {
        beforeEach(() => prepareTestBed());

        it('Should move selection with command', async () => {
            select00();

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 0, 0);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 1, 0, 1);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.DOWN,
            });
            expectSelectionToBe(1, 1, 1, 1);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(1, 0, 1, 0);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.UP,
            });
            expectSelectionToBe(0, 0, 0, 0);
        });

        it('Should skip cells in hidden rows / cols', async () => {
            [
                SetRowHiddenCommand,
                SetRowHiddenMutation,
                SetColHiddenCommand,
                SetColHiddenMutation,
                SetSelectedRowsVisibleCommand,
                SetSelectedColsVisibleCommand,
                SetRowVisibleMutation,
                SetColVisibleMutation,
            ].forEach((command) => {
                commandService.registerCommand(command);
            });

            selectRow(1, 1);
            await commandService.executeCommand(SetRowHiddenCommand.id);
            selectColumn(1, 1);
            await commandService.executeCommand(SetColHiddenCommand.id);

            select00();

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 2, 0, 2);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.DOWN,
            });
            expectSelectionToBe(2, 2, 2, 2);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(2, 0, 2, 0);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.UP,
            });
            expectSelectionToBe(0, 0, 0, 0);
        });
    });

    describe('Move cell to/through merged cells', () => {
        beforeEach(() => prepareTestBed(SELECTION_WITH_MERGED_CELLS_DATA));

        /**
         * A1 | B1 | C1
         * ---|    |----
         * A2 |    | C2
         *
         * When user clicks on C2 and move cursor left twice, A2 should not selected not A1.
         */
        it('Should select merged cell and move to next cell', async () => {
            select00();

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 0, 0);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 1, 1, 1);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 2, 0, 2);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.DOWN,
            });
            expectSelectionToBe(1, 2, 1, 2);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 1, 1, 1);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(1, 0, 1, 0);
        });
    });

    describe('Move to next cell that has value (skip cell)', () => {
        beforeEach(() => prepareTestBed(SELECTION_WITH_EMPTY_CELLS_DATA));

        it('Works on move', async () => {
            select00();

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: true,
            });
            expectSelectionToBe(0, 2, 0, 2);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: true,
            });
            expectSelectionToBe(0, 5, 1, 6);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: true,
            });
            expectSelectionToBe(0, 19, 0, 19);
        });

        it('Should jump over cells in hidden rows / cols no matter if there are empty', async () => {
            [
                SetRowHiddenCommand,
                SetRowHiddenMutation,
                SetColHiddenCommand,
                SetColHiddenMutation,
                SetSelectedRowsVisibleCommand,
                SetSelectedColsVisibleCommand,
                SetRowVisibleMutation,
                SetColVisibleMutation,
            ].forEach((command) => {
                commandService.registerCommand(command);
            });

            selectColumn(3, 10);
            await commandService.executeCommand(SetColHiddenCommand.id);

            select00();

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: true,
            });
            expectSelectionToBe(0, 2, 0, 2);

            // skip over hidden columns and jump to the last column
            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: true,
            });
            expectSelectionToBe(0, 19, 0, 19);
        });
    });

    describe('Expand to next selection or shrink to previous selection', () => {
        beforeEach(() => prepareTestBed(SELECTION_WITH_EMPTY_CELLS_DATA));

        it('Works on expand', async () => {
            select00();

            // expand

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 0, 0, 1); // A1:B1

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 0, 0, 2); // A1:C1

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 0, 0, 3); // A1:D1

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 0, 0, 4); // A1:E1

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 0, 1, 6); // A1:G2, because that is a merged cell

            // shrink
            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 1, 4); // A1:E2

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 1, 3); // A1:D2

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 1, 2); // A1:C2

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 1, 1); // A1:B2

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 1, 0); // A1:A2

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 1, 0); // A1:A2, remain unchanged when hitting boundary

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.UP,
            });
            expectSelectionToBe(0, 0, 0, 0); // A1:A1
        });
    });

    /**
     * A1 | B1 | C1
     * ---|    |----
     * A2 |    | C2
     *
     * When A1:C1 is selected and B2 is the primary cell, shrink should only shrink to one side.
     */
    describe('Shrink edge case', () => {
        beforeEach(() => prepareTestBed(SELECTION_WITH_MERGED_CELLS_DATA));

        it('Should shrink on side when primary is in the middle of selections', async () => {
            select(0, 0, 1, 2, 1, 1, true, false);

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 1, 1);

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 1, 1, 1);
        });
    });

    describe('Expand to next gap position or shrink to previous gap', () => {
        beforeEach(() => prepareTestBed(SELECTION_WITH_EMPTY_CELLS_DATA));

        it('Works on gap expand', async () => {
            select00();

            // expand

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: true,
            });
            expectSelectionToBe(0, 0, 0, 2); // A1:C1

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: true,
            });
            expectSelectionToBe(0, 0, 1, 6); // A1:G2, because that is a merged cell

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: true,
            });
            expectSelectionToBe(0, 0, 1, 19);

            // shrink

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
                jumpOver: true,
            });
            expectSelectionToBe(0, 0, 1, 6); // A1:G2

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
                jumpOver: true,
            });
            expectSelectionToBe(0, 0, 1, 2); // A1:C2

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
                jumpOver: true,
            });
            expectSelectionToBe(0, 0, 1, 0); // A1:A2
        });
    });

    describe('Select all', () => {
        beforeEach(() => prepareTestBed());

        it('Should first select all neighbor cells, and then the whole sheet', async () => {
            select00();

            const unchangedPrimaryInfo = {
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 0,
                actualRow: 0,
                actualColumn: 0,
                isMerged: false,
                isMergedMainCell: false,
            };

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: true,
            });
            expect(selectionManagerService.getLast()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 1,
                endColumn: 1,
                rangeType: RANGE_TYPE.NORMAL,
            });
            expect(selectionManagerService.getLast()!.primary).toEqual(unchangedPrimaryInfo);

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: true,
            });
            expect(selectionManagerService.getLast()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 19,
                endColumn: 19,
                rangeType: RANGE_TYPE.NORMAL,
            });
            expect(selectionManagerService.getLast()!.primary).toEqual(unchangedPrimaryInfo);

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: true,
            });
            expect(selectionManagerService.getLast()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 0,
                rangeType: RANGE_TYPE.NORMAL,
            });
            expect(selectionManagerService.getLast()!.primary).toEqual(unchangedPrimaryInfo);
        });

        it('Should directly select all if `expandToGapFirst` is false', async () => {
            select00();

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: false,
            });
            expect(selectionManagerService.getLast()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 19,
                endColumn: 19,
                rangeType: RANGE_TYPE.NORMAL,
            });

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: false,
            });
            expect(selectionManagerService.getLast()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 0,
                rangeType: RANGE_TYPE.NORMAL,
            });
        });

        it('Should not loop selection when `loop` is false', async () => {
            select00();

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: false,
                expandToGapFirst: false,
            });
            expect(selectionManagerService.getLast()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 19,
                endColumn: 19,
                rangeType: RANGE_TYPE.NORMAL,
            });

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: false,
                expandToGapFirst: false,
            });
            expect(selectionManagerService.getLast()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 19,
                endColumn: 19,
                rangeType: RANGE_TYPE.NORMAL,
            });
        });
    });
});
