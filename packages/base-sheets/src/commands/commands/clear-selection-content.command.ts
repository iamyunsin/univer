import {
    CommandType,
    ICellData,
    ICommand,
    ICommandService,
    IRange,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../services/selection-manager.service';
import {
    ISetRangeValuesMutationParams,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
} from '../mutations/set-range-values.mutation';

/**
 * The command to clear content in current selected ranges.
 */
export const ClearSelectionContentCommand: ICommand = {
    id: 'sheet.command.clear-selection-content',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const workbookId = workbook.getUnitId();
        const worksheet = workbook.getActiveSheet();
        const worksheetId = worksheet.getSheetId();
        const selections = selectionManagerService.getRangeDatas();
        if (!selections?.length) {
            return false;
        }

        const clearMutationParams: ISetRangeValuesMutationParams = {
            range: selections,
            worksheetId,
            workbookId,
            cellValue: generateNullCellValue(selections),
        };
        const undoClearMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            clearMutationParams
        );

        const result = commandService.executeCommand(SetRangeValuesMutation.id, clearMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // If there are multiple mutations that form an encapsulated project, they must be encapsulated in the same undo redo element.
                // Hooks can be used to hook the code of external controllers to add new actions.
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetRangeValuesMutation.id, undoClearMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetRangeValuesMutation.id, clearMutationParams);
                },
            });

            return true;
        }

        return false;
    },
};

// Generate cellValue from range and set v/m to null
function generateNullCellValue(range: IRange[]): ObjectMatrixPrimitiveType<ICellData> {
    const cellValue = new ObjectMatrix<ICellData>();
    range.forEach((range: IRange) => {
        const { startRow, startColumn, endRow, endColumn } = range;
        for (let i = startRow; i <= endRow; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
                cellValue.setValue(i, j, {
                    v: null,
                    m: null,
                });
            }
        }
    });

    return cellValue.getData();
}
