import {
    BooleanNumber,
    CommandType,
    ICommand,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    ISetWorksheetRightToLeftMutationParams,
    SetWorksheetRightToLeftMutation,
    SetWorksheetRightToLeftUndoMutationFactory,
} from '../mutations/set-worksheet-right-to-left.mutation';

export interface ISetWorksheetRightToLeftCommandParams {
    rightToLeft?: BooleanNumber;
    workbookId?: string;
    worksheetId?: string;
}

export const SetWorksheetRightToLeftCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-right-to-left',

    handler: async (accessor: IAccessor, params?: ISetWorksheetRightToLeftCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        let workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        let worksheetId = univerInstanceService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();
        let rightToLeft = BooleanNumber.FALSE;

        if (params) {
            workbookId = params.workbookId ?? workbookId;
            worksheetId = params.worksheetId ?? worksheetId;
            rightToLeft = params.rightToLeft ?? BooleanNumber.FALSE;
        }

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const setWorksheetRightToLeftMutationParams: ISetWorksheetRightToLeftMutationParams = {
            rightToLeft,
            workbookId,
            worksheetId,
        };

        const undoMutationParams = SetWorksheetRightToLeftUndoMutationFactory(
            accessor,
            setWorksheetRightToLeftMutationParams
        );
        const result = commandService.executeCommand(
            SetWorksheetRightToLeftMutation.id,
            setWorksheetRightToLeftMutationParams
        );

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetWorksheetRightToLeftMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(
                        SetWorksheetRightToLeftMutation.id,
                        setWorksheetRightToLeftMutationParams
                    );
                },
            });
            return true;
        }

        return false;
    },
};
