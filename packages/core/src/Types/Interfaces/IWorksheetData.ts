import { ObjectArrayType } from '../../Shared/ObjectArray';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { IKeyValue } from '../../Shared/Types';
import { BooleanNumber, SheetTypes } from '../Enum';
import { ICellData } from './ICellData';
import { IColumnData } from './IColumnData';
import { IFreeze } from './IFreeze';
import { IRange, IRangeType } from './IRange';
import { IRowData } from './IRowData';

// type MetaData = {
//     metadataId?: string;
//     metadataKey: string;
//     metadataValue?: string;
//     visibility?: DeveloperMetadataVisibility;
// };

// TODO: name of the interface is not accurate, should be IWorksheetSnapshot

/**
 * Properties of a worksheet's configuration
 *
 * TODO: 考虑将非通用配置，抽离到插件
 *
 * 比如 showGridlines 是sheet特有的，而如果实现如普通表格，就不需要 showGridlines
 */
export interface IWorksheetConfig {
    type: SheetTypes;
    id: string;
    name: string;
    tabColor: string;

    /**
     * Determine whether the sheet is hidden
     *
     * @remarks
     * See {@link BooleanNumber| the BooleanNumber enum} for more details.
     *
     * @defaultValue `BooleanNumber.FALSE`
     */
    hidden: BooleanNumber;
    freeze: IFreeze;
    /**
     * row and column  count in worksheet, not like excel, it is unlimited
     */
    rowCount: number;
    columnCount: number;
    zoomRatio: number;
    scrollTop: number;
    scrollLeft: number;
    defaultColumnWidth: number;
    defaultRowHeight: number;
    mergeData: IRange[];
    hideRow: [];
    hideColumn: [];
    status: BooleanNumber;
    cellData: ObjectMatrixPrimitiveType<ICellData>;
    rowData: ObjectArrayType<Partial<IRowData>>; // TODO:配置文件不能为ObjectArray实例，应该是纯json配置 @jerry
    columnData: ObjectArrayType<Partial<IColumnData>>;
    showGridlines: BooleanNumber;
    rowHeader: {
        width: number;
        hidden?: BooleanNumber;
    };
    columnHeader: {
        height: number;
        hidden?: BooleanNumber;
    };
    selections: IRangeType[];
    rightToLeft: BooleanNumber;
    // metaData: MetaData[];
    pluginMeta: IKeyValue;
}
