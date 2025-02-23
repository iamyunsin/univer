// import { SheetActionBase, ActionObservers, ISheetActionData, ObjectMatrixPrimitiveType, CommandUnit } from '@univerjs/core';
// import { SetNumfmtRangeData } from '../Apply';
// import { NumfmtController } from '../../Controller';

// export interface ISetNumfmtRangeActionData extends ISheetActionData {
//     numfmtMatrix: ObjectMatrixPrimitiveType<string>;
// }

// export class SetNumfmtRangeDataAction extends SheetActionBase<ISetNumfmtRangeActionData, ISetNumfmtRangeActionData> {
//     constructor(actionData: ISetNumfmtRangeActionData, commandUnit: CommandUnit, observers: ActionObservers) {
//         super(actionData, commandUnit, observers);
//         this._doActionData = {
//             ...actionData,
//         };
//         this._oldActionData = {
//             ...actionData,
//             numfmtMatrix: this.do(),
//         };
//     }

//     do(): ObjectMatrixPrimitiveType<string> {
//         return this.redo();
//     }

//     redo(): ObjectMatrixPrimitiveType<string> {
//         const { injector } = this._doActionData;
//         return SetNumfmtRangeData(this, this._doActionData.sheetId, this._doActionData.numfmtMatrix, injector!.get(NumfmtController));
//     }

//     undo(): void {
//         const { injector } = this._oldActionData;
//         SetNumfmtRangeData(this, this._oldActionData.sheetId, this._oldActionData.numfmtMatrix, injector!.get(NumfmtController));
//     }

//     validate(): boolean {
//         return false;
//     }
// }
