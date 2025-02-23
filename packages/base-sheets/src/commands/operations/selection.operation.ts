// This file provide operations to change selection of sheets.

import { ISelectionWithStyle } from '@univerjs/base-render';
import { CommandType, IOperation } from '@univerjs/core';

import { SelectionManagerService } from '../../services/selection-manager.service';

export interface ISetSelectionsOperationParams {
    workbookId: string;
    worksheetId: string;
    pluginName: string;
    selections: ISelectionWithStyle[];
}

export const SetSelectionsOperation: IOperation<ISetSelectionsOperationParams> = {
    id: 'sheet.operation.set-selections',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        selectionManagerService.replace(params!.selections);
        return true;
    },
};
